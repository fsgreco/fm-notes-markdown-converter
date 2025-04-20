import notes from './sources/notes.json' with { type: "json" }
import fs from 'node:fs/promises'
import TurndownService from "turndown"

let args = process.argv.splice(2)[0]

/** @type {'js'|'css'} */
let courseType = /css/.test(args) ? 'css' : 'js'
/* 
let { default: notes } = await import(`./sources/${args ? courseType : 'notes'}.json`, { 
	with: { type: "json" } 
} )  */

composeEntireMarkdown(notes)



/* FUNCTIONS */

/**
 * Take the notes and create a markdown file 
 * @param {Array<Note>} notes 
 */
async function composeEntireMarkdown( notes ) {

	/** Sort notes by its modules/lesson slug 
	 * @param {'lessonSlug'|'moduleSlug'} slug
	 * @return { (a:Note,b:Note) => number } A sorting function
	 */
	const sortBy = slug => (a,b) => getNum(a[slug]) - getNum(b[slug])

	// GENERATE MODULES ARRAY (via sorted by modules set) 
	const modules = Array.from( new Set([...notes].sort(sortBy('moduleSlug')).map( genModuleTitle )) )

	// CREATE A MAP: Modules > Lessons > Notes 
	/** @type {Map<Note['moduleTitle'],{ [key: Note['lessonTitle']]: Array<Note> }>} */
	const notesMap = new Map( modules.map( mod => [mod, {} ]) );
	// sort lessons and add them to respective modules
	[ ...notes ].sort( sortBy('lessonSlug') ).forEach( note => { 
		let module = notesMap.get(genModuleTitle(note))
		if ( ! module[`${note.lessonTitle}`] ) module[`${note.lessonTitle}`] = []
		let lessons = module[`${note.lessonTitle}`] 
		lessons.push(note)
	} )

	// COMPOSE MARKDOWN MODULE > LESSONS > NOTES 
	let markdownBody = []
	
	const courseName = notes[0].courseSlug.replace(/-/g, ' ').toUpperCase()
	const courseUrl = `https://courses.joshwcomeau.com/${notes[0].courseSlug}`
	let intro = [ `# ${courseName}`, `From Josh Comeau Course: [${courseName}](${courseUrl})` ]
	markdownBody.push( ...intro )

	for( const [module, lessons] of notesMap.entries()) {
		console.log({module, lessons: Object.keys(lessons).length })
		markdownBody.push(`## ${module}`)
		
		for (const [lesson, notes] of Object.entries(lessons) ) {
			markdownBody.push(`### ${lesson}`)
			markdownBody.push(`From [${notes[0].lessonSlug}](${notes[0].lessonHref})`)

			notes.forEach( note => markdownBody.push(composeLessonText(note)) )
		}
	}

	// WRITE CONTENT INTO FILE 
	let content = markdownBody.join('\n\n')
	await fs.writeFile(`./dist/${notes[0].courseSlug}.md`, content)
}

/**
 * Compose lesson text function
 * @param {Note} note
 */
function composeLessonText(note) {
	let markdownBody = []	
	if (note.type === 'lesson-video') {
		markdownBody.push(`- From video: **${note.metadata.videoTitle}** at ${convertSeconds(note.metadata.bookmarkedTime)}:\n`)
	} else {
		markdownBody.push(`> ${sanitizeForMarkdown(note.metadata.highlighted).replace(/(?!`)<(dl|img|div|canvas|figcaption|section|body|form)>(?!`)/g, '`<$1>`')}\n`)
	}
	markdownBody.push( parseNoteContent( note.content ) )
	return markdownBody.join('\n')
}

/**
 * Takes the HTML Content and return a Markdown string
 * @param {Note['content']} htmlContent 
 * @returns 
 */
function parseNoteContent(htmlContent) {
	let converter = new TurndownService()
	converter.addRule('removeEm', {
		filter: 'em',
		replacement: (content, node ) => node.innerHTML
	})
	converter.addRule('convertPre', {
		filter: 'pre',
		replacement: (content) => '```' + (courseType === 'js' ? 'jsx' : 'css') + '\n' + content + '\n' + '```'
	})
	//const preTreatedHtmlContent = htmlContent.replace(/(?<!`)&lt;(.*)&gt;(?<!`)/g,'`&lt;$1&gt;`')
	// This is not ideal, either replace the remainent manually with this rule on the editor (or use sanitizeAnchorTags):
	// search: (?!`)<(input|script|textarea|select)>(?!`) replace: `<$1>`
	const markdown = converter.turndown(htmlContent)
	//console.log({htmlContent, markdown})
	return sanitizeForMarkdown(markdown)
}



/* HELPERS */

// * if slug has 'project' instead of number it will be NaN - if NaN assign a hight number and set 'project on module title

/** Create module title @param {Note} note @return {`${number} - ${Note['moduleTitle']}`} */
function genModuleTitle(note) { return `${  getNum(note.moduleSlug) === 100 ? 'Project' : getNum(note.moduleSlug) } - ${note.moduleTitle}`}

/** Get num from slug @param {Note['moduleSlug'] | Note['lessonSlug']} str */
function getNum(str) { 
	let lessonNum = Number(str.split('-')[0]) 
	if ( ! Number.isNaN(lessonNum) ) return lessonNum
	else return 100
}

function sanitizeForMarkdown(str) {
	//* This treat also `\\[ \\] \\_ on pre code
	const removeEscapedSymbols = str => str.replace(/\\`/g,'`').replace(/\\_/g,'_').replace(/\\(\[|\])/g,'$1')
	const sanitizeAnchorTags = str => str.replace(/(?!`)<(input|script|textarea|select|option)>(?!`)/g, '`<$1>`')
	//! Important: sanitizeAnchor on top of removeEscapedSymbols!
	return sanitizeAnchorTags( removeEscapedSymbols( str ) )
}

function convertSeconds(sec) {
	let minutes = Math.floor( sec / 60 );
	let seconds = Math.round( sec % 60 ); 
	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}m`
}



/* --- TYPES --- */

/** 
 * @typedef {object} Note
 * @property {string} id
 * @property {string} content
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {'lesson-text'|'lesson-video'} type
 * @property {string} courseSlug
 * @property {`${number}-${string}-${string}`} moduleSlug
 * @property {string} moduleTitle
 * @property {`${`${number}.`|''}${number}-${string}-${string}`} lessonSlug
 * @property {string} lessonTitle
 * @property {string} lessonHref
 * @property {object} metadata
 * @property {string?} metadata.highlighted
 * @property {string?} metadata.videoId
 * @property {string?} metadata.videoTitle
 * @property {number?} metadata.bookmarkedTime
 */
