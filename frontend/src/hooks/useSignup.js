import { useState, useEffect } from "react"
import Cookies from 'js-cookie'
import { useAuthContext } from "./useAuthContext"

export const useSignup = () => {
    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)
    const [isCancelled, setIsCancelled] = useState(false)

    const { dispatch } = useAuthContext()

    const signup = async (username, email, password, confirmation, thumbnail) => {
        setError(null)
        setIsPending(true)
        
        try {
            const data = new FormData()
            data.append('image', thumbnail)
            // data.append('email', email)

            const csrftoken = Cookies.get('csrftoken');

            const response = await fetch(`http://127.0.0.1:8000/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmation
                })
            })
            const user = await response.json()
            console.log(user.error)
            if(user.error) {
                console.log('error')
            }
            if(user.error) {
                throw new Error(user.error)
            }
            console.log(user, user.id)

            const profile = await fetch(`http://127.0.0.1:8000/api/user/${user.id}`, {
                method: 'POST',
                body: data
            })

            dispatch({ type: 'LOGIN', payload: user });
            console.log('dispatched')

            if(!isCancelled) {
                setIsPending(false)
                setError(null)
            }

        } catch(err) {
            // if (err.name === "AbortError") {
            //     console.log('the fetch was aborted')
            // } else {
            if(!isCancelled) {
                console.log(err)
                setError(err.message)
                setIsPending(false)
            }
        }
    }
    
    useEffect(() => {

        return setIsCancelled(true)
    }, [])

    return { error, isPending, signup }
}
