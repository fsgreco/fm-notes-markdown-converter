/* --- TYPES --- */

/** 
 * @typedef {object} BaseNote
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
 */

/**
 * @typedef {Object} VideoNoteMetadata
 * @property {string} videoId - Video identifier
 * @property {string} videoTitle - Title of the video
 * @property {number} bookmarkedTime - Timestamp in seconds where the note was taken
 */

/**
 * @typedef {Object} TextNoteMetadata
 * @property {string} highlighted - Text that was highlighted when taking the note
 */

/**
 * @typedef {BaseNote & {type: 'lesson-video', metadata: VideoNoteMetadata}} VideoNote
 */

/**
 * @typedef {BaseNote & {type: 'lesson-text', metadata: TextNoteMetadata}} TextNote
 */

/**
 * Note object from Josh Comeau's courses
 * @typedef {VideoNote | TextNote} Note
 */

// You can export these if using modules
export {};