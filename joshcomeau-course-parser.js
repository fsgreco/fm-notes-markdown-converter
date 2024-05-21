import notes from './sources/notes.json' assert { type: "json" }
import fs from 'node:fs/promises'
import TurndownService from "turndown"

/** @type {'js'|'css'} */
let courseType = /css/.test(process.argv.splice(2)[0]) ? 'css' : 'js'

composeEntireMarkdown(notes)



/* FUNCTIONS */

/**
 * Take the notes and create a markdown file 
 * @param {Array<Note>} notes 
 */
async function composeEntireMarkdown( notes ) {

	let markdownBody = []
	markdownBody.push(composeIntro(notes[0]))

	/** @param {Note['lessonSlug']} str */
	const getNum = str => str.split('-')[0].split('.')[0]
	// SORT - order by lesson 
	let notesSortedByLesson = [...notes].sort((a,b) => parseInt(getNum(a.lessonSlug)) - parseInt(getNum(b.lessonSlug)))
	// SORT - order by module 
	const notesSortedByModule = [...notesSortedByLesson].sort((a,b) => parseInt(getNum(a.moduleSlug)) - parseInt(getNum(b.moduleSlug)) )

	// GENERATE MODULES ARRAY
	const modules = Array.from( new Set(notesSortedByModule.map( note => note.moduleTitle )) )

	// CREATE A MAP: Modules > Lessons > Notes 
	/** @type {Map<Note['moduleTitle'],{ [key: Note['lessonTitle']]: Array<Note> }>} */
	const notesMap = new Map( modules.map( mod => [mod, {} ]) )
	notes.forEach( note => { 
		let module = notesMap.get(note.moduleTitle)
		if ( ! module[`${note.lessonTitle}`] ) module[`${note.lessonTitle}`] = []
		let lessons = module[`${note.lessonTitle}`] 
		lessons.push(note)
	} )

	// COMPOSE MARKDOWN MODULE > LESSONS > NOTES 
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
 * Compose will return a markdown string
 * @param {Note} oneNote 
 * @returns 
 */
function composeIntro(oneNote) {
	const title = createCourseTitle( oneNote.courseSlug )
	let intro = [ 
		`# ${title}`, 
		`From Josh Comeau Course: [${title}](https://courses.joshwcomeau.com/${oneNote.courseSlug})` ]
	return intro.join('\n')
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
		markdownBody.push(`Josh quote:\n> ${sanitizeForMarkdown(note.metadata.highlighted)}\n`)
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

/**
 * Take the course slug and return a string
 * @param {Note['courseSlug']} courseSlug 
 * @returns 
 */
function createCourseTitle(courseSlug) {
	return courseSlug.replace(/-/g, ' ').toLocaleUpperCase()
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
