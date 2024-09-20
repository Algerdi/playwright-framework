import { JSONData } from '../interfaces/interfaces'

interface UsersData {
    [key: string]: {
        status: string
        username: string
        password: string
    }
}

export function transformUsersJson(json: JSONData): UsersData {
    const result: UsersData = {}
    const users = json.data

    const keys = Object.keys(users).slice(0, 2)

    for (const key of keys) {
        const userEntry = users[key]
        const userData = userEntry.data

        result[key] = {
            status: 'can',
            username: userData.username,
            password: userData.password
        }
    }

    result['wrongUser'] = {
        status: 'cannot',
        username: 'username',
        password: 'password'
    }

    return result
}