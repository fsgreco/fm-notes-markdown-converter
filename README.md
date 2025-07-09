# Frontend Masters / Josh Comeau notes markdown converter

This script generates a markdown file from the notes you wrote on **Frontend Masters** or **Josh Comeau** courses.  
It takes the exported json file with your notes and convert it to a markdown file. 

![before and after](assets/readme-image.png)

## How to use: 
- [Instructions for Frontend Masters courses](#frontend-masters-instructions)
- [Instructions for Josh Comeau's courses](#josh-comeau-instructions)  

--- 

### For Frontend Masters Courses: <a id="frontend-masters-instructions"></a>
> [!NOTE]  
> UPDATE NOTE: Nowadays Frontend Masters lets you export a markdown file right away from their platform. The output this project produces is a bit different since it has been developed on my own preferences, you can give it a try if you want anyways.

1. Clone this repository
2. Download the json file with your notes from the course platform.
3. Add the json file inside `sources` directory, rename it: `data.json`.
4. Launch the script with `npm start`
5. The file will be generated inside `dist` directory

#### Notes:

* Feedback is appreciated! This is an implementation I found convenient for myself (a really opinionated implementation at least), any suggestions you have will be welcome. 

* You can generate a version without timestamp links by running `npm start -- nolinks` at step 4.

--- 

### For Josh Comeau course notes: <a id="josh-comeau-instructions"></a>

1. Install dependencies with: `npm install`
2. Download the json file from Josh Comeau's course platform.
3. Add the json file inside `sources` directory, it should be called: `notes.json`.
4. Launch the script with:
```bash
npm run josh-course-parser
```
5. The file will be generated inside `dist` directory

#### Available options

You can pass options preceeded by `--` to define custom `input`, `output` and `course` type: 
```sh
npm run josh-course-parser -- --course="css" 
```
More examples on this table: 
| Option   | Shorthand | Example                                                    | Default value          |
|----------|-----------|------------------------------------------------------------|------------------------|
| --input  | -i        | npm run josh-course-parser -- -i "./mynotes.json"          | "./sources/notes.json" |
| --output | -o        | npm run josh-course-parser -- --output="./mynotes.md"      | "./dist/notes.md"      |
| --course | -c        | npm run josh-course-parser -- -c "css" -o "./css-notes.md" | "js"                   |

By default it will parse notes from **The Joy Of React** course.  
You can change the option `--course` in case you need notes for **CSS in React** or the new **Whimsical Animations** course.  
Available options for this are `js`, `css` or `animations`.

