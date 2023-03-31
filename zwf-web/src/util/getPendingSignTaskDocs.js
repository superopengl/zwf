export function getPendingSignTaskDocs(task) {
  return task?.docs.filter(d => d.signRequestedAt && !d.signedAt) ?? [];
}
