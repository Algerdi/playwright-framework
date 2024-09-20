export interface UserData {
  username: string
  password: string
}

export interface JSONData {
  model: string
  data: {
    [key: string]: {
      data: UserData
    }
  }
}
