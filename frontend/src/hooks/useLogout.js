import { useEffect, useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useLogout = () => {
    const [isCancelled, setIsCancelled] = useState(false)
    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)

    const { dispatch } = useAuthContext()

    const logout = async () => {
        setError(null)
        setIsPending(true)

        try {

            await fetch(`http://127.0.0.1:8000/api/logout`)
            
            // dispatch logout action
            dispatch({ type: 'LOGOUT' })

            // not update states after component unmount
            if(!isCancelled) {
                setError(null)
                setIsPending(false) 
            }
            
        } catch(err) {
            // not update states after component unmount
            if(!isCancelled) {
                console.log(err.message)
                setError(err.message)
                setIsPending(false)
            }
        }  
    }

    useEffect(() => {
        return () => setIsCancelled(true)
    }, [])

    return { error, isPending, logout }
}