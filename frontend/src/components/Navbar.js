import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { useLogout } from '../hooks/useLogout'
import useWindowSize from '../hooks/useWindowSize'
import Avatar from './Avatar'

import './Navbar.css'

export default function Navbar() {
    const [open, setOpen] = useState(false)

    const { isPending, logout } = useLogout();
    const { user } = useAuthContext();
    const { size } = useWindowSize();

    const toggleNav = () => {
        if(size[0] <= 768) setOpen(prev => !prev)
    }

    useEffect(() => {
        if(size[0] > 768) {
            setOpen(true)
        }
        if(size[0] <= 768) {
            setOpen(false)
        }
    }, [size[0]])

    return (
        <div className="nav-container">
            {/* <div className="page-header"> */}
                <div className="navbar">
                    <Link className="logo" to="/">
                        <h1>UMAI</h1>
                    </Link>
                    <div className="nav-links">
                        {open && (
                            <nav>
                                {!user && (
                                    <>
                                        <Link onClick={toggleNav} className="link" to="/login">Login</Link>
                                        <Link onClick={toggleNav} className="link" to="/signup">Signup</Link>
                                    </>
                                )}
                                {user && ( 
                                    <>
                                        <Link onClick={toggleNav} className="link" to="/">All</Link>
                                        <Link onClick={toggleNav} className="link" to="/create">Create</Link>
                                        <Link onClick={toggleNav} className="link" to="/favorite">Favorite</Link>
                                        
                                        {!isPending && <button className="btn" onClick={logout}>Logout</button>}
                                        {isPending && <button className="btn" disabled>Logging out...</button>}
                                    </>
                                )}
                            </nav>
                        )}
                        {user && ( 
                            <Link to={`/user/${user.id}`} className="user-display">
                                <h5>Hello {user.username}</h5>
                                <Avatar src={user.img_url} />
                            </Link> 
                        )}
                        <div class="menu-btn" onClick={toggleNav}>
                            <div class="burger"></div>
                        </div>
                        {/* <div class="menu-btn">
                            <div class="burger"></div>
                        </div> */}
                    </div>
                </div>
                {/* <nav className="small-nav">
                    {!user && (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    )}
                    {user && ( 
                    <>
                        <Link to="/">All</Link>
                        <Link to="/create">Create</Link>
                        <Link to="/favorite">Favorite</Link>
                        
                        {!isPending && <button className="btn" onClick={logout}>Logout</button>}
                        {isPending && <button className="btn" disabled>Logging out...</button>}
                    </>
                    )}
                </nav> */}
            {/* </div> */}
            {/* <div className="space"></div> */}
        </div>
    )
}
