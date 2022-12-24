declare module "webos-service" {
    class Service {
        constructor(name: string)

        activityManager: ActivityManager

        register(method: string, onMessage: <T>(message: Message<T>) => void)
    }

    class ActivityManager {
        idleTimeout: number
    }

    export = Service
}

declare type Message<T, R = any> = {
    respond(reply: Reply<R>)
    payload: T
}

declare type Reply<T> = { returnValue: boolean } & ({payload?: T} | { errorCode: number; errorText: string; })