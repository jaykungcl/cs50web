import { useState, useEffect } from "react"
import Cookies from 'js-cookie'
import { useAuthContext } from './useAuthContext'

export const useLogin = () => {
    const [isCancelled, setIsCancelled] = useState(false)
    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)

    const { dispatch } = useAuthContext()

    const login = async (username, password) => {
        
        setError(null)
        setIsPending(true)

        try {
            const csrftoken = Cookies.get('csrftoken');

            const response = await fetch(`http://127.0.0.1:8000/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    username,
                    password
                })
            })
            if(!response.ok) {
                throw new Error(response.statusText)
            }
            const user = await response.json()
            // console.log(user)
            if(user.error) {
                throw new Error(user.error)
            }

            dispatch({ type: 'LOGIN', payload: user });

            if(!isCancelled) {
                setIsPending(false)
                setError(null)
            }
        } catch(err) {
            if(!isCancelled) {
                console.log(err)
                setError(err.message)
                setIsPending(false)
            }
        }

    }

    useEffect(() => {
        return () => setIsCancelled(true)
    }, [])


    return { error, isPending, login }
}
