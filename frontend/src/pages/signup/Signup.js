import { useState } from "react"
import { useSignup } from "../../hooks/useSignup"

export default function Signup() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [thumbnail, setThumbnail] = useState(null)
    const [thumbnailError, setThumbnailError] = useState(null)

    const { error, isPending, signup } = useSignup()


    const handleSubmit = async (e) => {
        e.preventDefault()

        signup(username, email, password, confirmation, thumbnail)
    }

    const handleFileChange = (e) => {
        setThumbnail(null)

        let selected = e.target.files[0]

        if(!selected) {
            setThumbnailError('Please select a file')
            return
        }
        if(!selected.type.includes('image')) {
            setThumbnailError('Selected file must be an image')
            return
        }
        if(selected.size > 100000) {
            setThumbnailError('Image file size must be less than 100kb')
            return
        }

        setThumbnailError(null)
        setThumbnail(selected)
    }

    return (
        <div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Signup</h2>
                <label>
                    <span>Username:</span>
                    <input 
                        required
                        type="text"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                    />
                </label>
                <label>
                    <span>Email:</span>
                    <input 
                        required
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                </label>
                <label>
                    <span>Password:</span>
                    <input 
                        required
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                </label>
                <label>
                    <span>Confirm Password:</span>
                    <input 
                        required
                        type="password"
                        onChange={(e) => setConfirmation(e.target.value)}
                        value={confirmation}
                    />
                </label>
                <label>
                    <span>Profile Picture:</span>
                    <input 
                        type="file"
                        onChange={handleFileChange}
                    />
                    {thumbnailError && <div className="error">{thumbnailError}</div>}
                </label>
                
                {!isPending && <button className="btn">Sign up</button>}
                {isPending && <button className="btn" disabled>Loading</button>}
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}
