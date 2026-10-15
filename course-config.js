// Producer settings for a new play. Existing plays keep their saved route options.
export const courseSettings = {
  showDeskInterlude:true,
  includeNewBooks:true,
  newBooksExactLocation:null
};
export function normalizeCourseOptions(value=courseSettings) {
  return {showDeskInterlude:typeof value?.showDeskInterlude==='boolean'?value.showDeskInterlude:courseSettings.showDeskInterlude,
    includeNewBooks:typeof value?.includeNewBooks==='boolean'?value.includeNewBooks:courseSettings.includeNewBooks};
}
