import {useEffect, useState} from "react";

export function useStorage<T>(key: string): {
    get: () => T | null,
    set: (data: T) => void
    clear: () => void
} {
    const [data, setData] = useState(localStorage.getItem(key))

    useEffect(() => {
        setData(localStorage.getItem(key))
    }, [key])

    return {
        get: () => data ? JSON.parse(data) : null,
        set: data => {
            const json = JSON.stringify(data)
            localStorage.setItem(key, json)
            setData(json)
        },
        clear: () => {
            localStorage.removeItem(key)
            setData(null)
        }
    }
}