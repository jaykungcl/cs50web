import { useFetch } from '../hooks/useFetch';

// styles
import HeartSolid from '../assets/heart-solid.svg'
import HeartOutline from '../assets/heart-regular.svg'

export default function Heart({ url }) {
    const { data: recipe, putData } = useFetch(url, 'PUT');
    console.log(recipe)

    return (
        <>
            {recipe && (
                <div onClick={() => putData({ like: !recipe.liked })} className="heart">
                    {!recipe.liked && <img src={HeartOutline} alt="like button" />}
                    {recipe.liked && <img src={HeartSolid} alt="unlike button" />}
                </div>
            )}
        </>
    )
}
