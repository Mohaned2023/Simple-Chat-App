/**
 * This function use to omit object keys.
 * @param obj The object. 
 * @param keys List of keys to omits.
 * @returns New object without the omited keys.
 * @author Mohaned2023
 */
export function omitObjectKeys<T extends object, K extends keyof T>( obj: T, keys: K[]): Omit<T,K> {
    return Object.fromEntries(
        Object.entries(obj).filter( ([key]) => !keys.includes(key as K) )
    ) as Omit<T,K> ;
}