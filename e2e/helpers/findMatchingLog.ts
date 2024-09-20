export function findMatchingLog(
    logs: { time: Date; requestType: any; user: any; todoId: number; }[],
    todoId: number,
    user: string,
    requestType: string,
    requestTime: Date
) {
    const allowedTimeDifference = 5000

    return logs.find(log => {
        const isMatchingId = log['todoId'] === todoId
        const isMatchingUser = log['user'] === user
        const isMatchingRequestType = log['requestType'] === requestType

        const logTime = new Date(log['time']).getTime()
        const requestTimeMs = requestTime.getTime()
        const timeDifference = Math.abs(logTime - requestTimeMs)

        return isMatchingId && isMatchingUser && isMatchingRequestType && timeDifference <= allowedTimeDifference
    })
}