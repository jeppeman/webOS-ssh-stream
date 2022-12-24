export {}
declare global {
    namespace webOS {
        const service: Service
        function platformBack()
    }

    declare class Service {
        request<T>(url: string, options: ServiceRequestOptions<T>)
    }

    declare type ServiceRequestOptions<T> = {
        method: string,
        parameters?: {},
        onSuccess?: (response: ServiceRequestResponse<T>) => void
        onFailure?: (error: any) => void
        onComplete?: () => void
        subscribe?: boolean,
        resubscribe?: boolean
    }

    declare type ServiceRequestResponse<T> = {
        payload: T
    }
}
