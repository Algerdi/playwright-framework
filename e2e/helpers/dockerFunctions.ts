async function getRunningContainers(dockerInstance) {
    const containers = await dockerInstance.listContainers()
    return containers
        .filter(container => container.Image.includes('log-message-processor'))
        .map(container => ({
            id: container.Id,
        }))
}

async function getContainerLogs(dockerInstance, containerId) {
    const container = dockerInstance.getContainer(containerId)
    const logs = await container.logs({
        follow: false,
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: 20
    })

    const logString = logs.toString()
    const logLines = logString.split('\n')
    return logLines
}

export async function getLogs(dockerInstance) {
    const containersList = await getRunningContainers(dockerInstance)
    const logs = await getContainerLogs(dockerInstance, containersList[0]['id'])
    return logs
}