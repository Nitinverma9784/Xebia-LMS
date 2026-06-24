/** Maps a semantic color name to the badge color token used in index.css. */
export const LEVEL_COLOR = {
  Beginner: 'teal',
  Intermediate: 'blue',
  Advanced: 'purple',
}

export const CONTENT_TYPE_COLOR = {
  heading: 'purple',
  text: 'gray',
  code: 'blue',
  image: 'amber',
  video: 'rose',
  callout: 'green',
  table: 'teal',
}

export function countModules(course) {
  return course.modules.length
}

export function countSubmodules(course) {
  return course.modules.reduce((sum, m) => sum + m.submodules.length, 0)
}

export function countContents(submodule) {
  return submodule.contents.length
}

export function statusBadge(course) {
  if (!course.isActive) return { label: 'Inactive', color: 'gray' }
  return course.isPublished
    ? { label: 'Published', color: 'green' }
    : { label: 'Draft', color: 'amber' }
}
