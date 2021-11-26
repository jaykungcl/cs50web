import { useParams } from 'react-router'
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import Avatar from '../../components/Avatar';
import { useFetch } from '../../hooks/useFetch';

// styles
import './Recipe.css'
// import Heart from '../../components/Heart';

import Heart from '../../assets/heart-solid.svg'
import HeartOutline from '../../assets/heart-regular.svg'


export default function Recipe() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)
    // const [options, setOptions] = useState(null)
    const [method, setMethod] = useState('GET')

    // const [like, setLike] = useState(false)

    const csrftoken = Cookies.get('csrftoken');

    const { id } = useParams();
    const url = 'http://127.0.0.1:8000/api/recipes/' + id;
    // const { error, isPending, data: recipe } = useFetch(url);
    // const { putData } = useFetch(url, 'PUT');

    // useEffect(() => {
    //     if(recipe) {
    //         setLike(recipe.liked)
    //         console.log("like: " + like, "recipe.liked: " + recipe.liked)
    //     }
        
    // }, [recipe])

    const toggleLike = () => {
        setMethod('PUT');
        console.log('toggle')

        // setOptions({
        //     method: method,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'X-CSRFToken': csrftoken
        //     },
        //     body: JSON.stringify({ like: !data.liked })
        // })
    }

    useEffect(() => {

        const controller = new AbortController()
        
        const fetchData = async (fetchOptions) => {
            setError(null)
            setIsPending(true)
            
            try { 
                // console.log(options)
                const res = await fetch(url, { ...fetchOptions, signal: controller.signal })
                if(!res.ok) {
                    throw new Error(res.statusText)
                }
                const data = await res.json()
                console.log(data)

                setIsPending(false)
                setData(data)
                setError(null)

            } catch(err) {
                if (err.name === "AbortError") {
                    console.log('the fetch was aborted')
                } else {
                    setIsPending(false)
                    setError('Could not fetch the data')
                }
            }
        }

        if (method === 'GET') {
            fetchData()
        }
        if (method === 'PUT') {
            fetchData({
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ like: !data.liked })
            }).then(() => {
                setMethod('GET')
            })
            
        }
        
        return () => controller.abort()
    }, [url, method])


    return (
        <div className="recipe">
            {error && <p className="error">{error}</p>}
            {/* {isPending && <p className="loading">Loading...</p>} */}
            {data && (
                <>
                    <h2 className="page-title">{data.title}</h2>

                    <div onClick={toggleLike} className="heart">
                        {!data.liked && <img src={HeartOutline} alt="like button" />}
                        {data.liked && <img src={Heart} alt="unlike button" />}
                    </div>
                    {/* <Heart url={url} /> */}

                    <p>Takes {data.cooking_time} to cook</p>
                    <Avatar src={data.img_url} />
                    <p>Created by {data.created_by}</p>
                    <ul>
                        {data.ingredients.map(ing => (
                            <li key={ing}>{ing}</li>
                        ))}
                    </ul>
                    <p className="method">{data.method}</p>
                </>
            )}
        </div>
    )
}
