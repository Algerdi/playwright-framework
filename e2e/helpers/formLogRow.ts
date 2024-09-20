export function formLogRow(rawLogsList: []) {
  return rawLogsList
    .filter((log: string) => log.includes("'zipkinSpan"))
    .map((log: string) => {
      const timeRegex = /(?:[^0-9]*)(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/
      const timeMatch = log.match(timeRegex)

      if (!timeMatch) {
        throw new Error('There is no time fragment that matches the requirements of the regular expression')
      }

      const trimmedTimeString = timeMatch[1].slice(0, 23) + 'Z'
      const time = new Date(trimmedTimeString)

      const jsonStartIndex = log.indexOf('{')
      let jsonString = log.slice(jsonStartIndex)
      jsonString = jsonString
        .replace(/'/g, '"')
        .replace(/None/g, 'null')
        .replace(/False/g, 'false')
        .replace(/True/g, 'true')

      const logData = JSON.parse(jsonString)
      const requestType = logData.opName
      const user = logData.username
      const todoId = Number(logData.todoId)

      return { time, requestType, user, todoId }
    })
}