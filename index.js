import data from './sources/data.json' with {type: "json"}
import fs from 'node:fs/promises'

let args = process.argv.splice(2)[0]

/** @type {boolean} */
let withTimeLinks = /nolinks/.test(args) ? false : true

let content = generateMarkdown(data, withTimeLinks)

try {
	await fs.writeFile(`./dist/${data.course}.md`, content )
	console.log('Write file ', `${data.course}.md`)
} catch (err) {
	console.error(err)
} 


/**
 * Generate markdown content with the notes from the exporte Json (of Frontend Masters courses)
 * @param {Object} data Course notes from json
 * @param {Boolean} withTimeLinks decide if you want to preserve timestamp links to the notes; default = true
 * @returns Returns the markdown content to be written into a file
 */
function generateMarkdown( data, withTimeLinks = true ) {
	let markdownBody = []
	let markdownFootNotes = []

	let intro = [
		`# ${data.course}`, 
		`From Frontend Masters Course: [${data.course}](${data.url})`
	]
	markdownBody.push(intro.join('\n'))


	data.chapters.forEach( ({chapter, lessons}) => {

		markdownBody.push(`## ${chapter}`)

		lessons.forEach( ({lesson, items}) => {
			let notes = items?.filter( item => item.type === 'note')
			if (notes && notes.length > 0) {

				markdownBody.push(`### ${lesson}`)
				notes.forEach(note => {
					let row = `${note.body} ${withTimeLinks ? `\n~ [${note.timestamp}]  ` : ''}`
					markdownBody.push(row)
					markdownFootNotes.push(`[${note.timestamp}]: ${note.url}`)
				})
			}
		})
	})

	// create a markdown file with body 
	const markdownContent = markdownBody.join('\n\n') + `${withTimeLinks ? '\n\n---\n\n' + markdownFootNotes.join('\n') : ''}`

	return markdownContent
}
