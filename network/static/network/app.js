const postView = document.querySelector('#posts-view');
const profileView = document.querySelector('#profile-view');
const form = document.querySelector('#new-post-form');

document.addEventListener('DOMContentLoaded', () => {
    
    document.addEventListener('click', e => {
        // console.log(e.target.classList.value)
        const post = e.target.closest('.post');

        if(e.target.classList.contains('edit-btn')) {
            // console.log(post.id);
            e.target.classList.add('disabled');
            edit_post(post.id);
        } else if(e.target.classList.contains('update-btn')) {
            // console.log(post.id);
            update_post(post.id);
        } else if(e.target.classList.contains('like-btn') && !e.target.classList.contains('disabled')) {
            // console.log('heart');
            console.log('like')
            toggle_like(post.id, false);
        } else if(e.target.classList.contains('unlike-btn') && !e.target.classList.contains('disabled')) {
            console.log('unlike');
            toggle_like(post.id, true);
        } else if(e.target.classList.contains('show-profile') || e.target.parentElement.classList.contains('show-profile')) {
            console.log('profile');
            user_id = e.target.dataset.userId ? e.target.dataset.userId: e.target.parentElement.dataset.userId;
            get_profile(user_id);
            get_posts(user_id, 1);
        } else if(e.target.classList.contains('follow-btn')) {
            user_id = e.target.closest('.media').dataset.userId;
            toggle_follow(user_id, false);
        } else if(e.target.classList.contains('unfollow-btn')) {
            user_id = e.target.closest('.media').dataset.userId;
            toggle_follow(user_id, true);
        } else if(e.target.classList.contains('following-view')) {
            get_posts('following', 1);
        } else if(e.target.classList.contains('page-btn') || e.target.parentElement.classList.contains('page-btn')) {
            const page_num = e.target.dataset.page ? e.target.dataset.page: e.target.parentElement.dataset.page;
            // console.log(page_num)
            get_posts(postView.className, page_num);
        }
    });

    get_posts('all', 1);
})

function get_profile(user_id) {
    profileView.innerHTML = '';

    fetch(`profile/${user_id}`)
    .then(response => response.json())
    .then(data => {
        profile = data[0];

        const element = document.createElement('div');
        element.className = 'media';
        element.dataset.userId = `${profile.id}`

        let follow_btn = '';
        console.log(profile.can_follow)


        if(profile.can_follow) {
            follow_btn = profile.is_following ? 
                `<a class="unfollow-btn btn btn-info btn-sm">
                    <i class="fa fa-check-circle" aria-hidden="true"></i> Following
                </a>` :
                `<a class="follow-btn btn btn-outline-info btn-sm">
                    <i class="fa fa-user-circle-o" aria-hidden="true"></i> Follow
                </a>` ;
        } else {
            follow_btn = `<input class="btn btn-sm hidden">`
        }

        element.innerHTML = `
            <img class="img-thumbnail rounded-circle" src="${profile.img_url}" width="150px" height="150px">
            <div class="profile-content media-body pl-3">
                <div class="d-flex justify-content-end">
                    <span>${follow_btn}</span>
                </div>
                <div class="px-2">
                    <h1 class="mb-3">${profile.username}</h1>
                    <span>${profile.following_num} </span>
                    <span class="small text-muted">Following</span>
  
                    <span>${profile.followers_num} </span>
                    <span class="small text-muted">Followers</span>
                </div>
            </div>
        `

        profileView.append(element);
    })
}

function get_posts(page, page_num) {
    page_num = parseInt(page_num);

    if(page === 'all' || page === 'following') {
        if(form) {
            form.style.display = 'block';
        }
        profileView.style.display = 'none';
    } else {
        if(form) {
           form.style.display = 'none'; 
        }
        profileView.style.display = 'block';
    }

    postView.innerHTML = '';

    // let url = new URL
    // Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    fetch(`posts/${page}/${page_num}`)
    .then(response => response.json())
    .then(data => {
        // console.log(typeof posts)
        // console.log(Object.keys(posts).length === 0)
        
        posts = data.posts;
        num_pages = data.num_pages;
        // if(page === 'all') {
        //     postView.className = 'all';
        // } else if(page === 'following') {
        //     postView.className = 'following';
        // } else {
        //     postView.className = 'profile';
        // }
        postView.className = page;

        posts.forEach(post => {
            postView.append(new_post(post));
            // if(post.has_following_user) {
            //     following
            // }
        });
        if(Object.keys(posts).length === 0){
            const element = document.createElement('div');
            element.className = 'text-center text-muted my-5'
            // console.log('hi')
            if(page === 'following') {
                element.innerHTML = `
                    <h5>You haven't follow anyone yet!</h5>
                `;
            } else {
                element.innerHTML = `
                    <h5>You have no post to show.</h5>
                `;
            }
            postView.append(element);
        }

        if(num_pages > 1) {
            const element = document.createElement('nav');
            element.innerHTML = `

                <ul class="pagination justify-content-end">
                   
                    
                </ul>
   
            `;
        
            const pagination = element.children[0];
            // const page_btn = document.createElement('li')
            // page_btn.className = 'page-item'
            const nums = [...Array(num_pages).keys()].map(num => num + 1);
            console.log(typeof page_num)
            console.log(typeof num_pages)

            if(page_num === 1) {

                nums.forEach(num => {
                    console.log('run')
                    if(num === page_num || num === page_num + 1 || num === page_num + 2) {
                        pagination.append(create_page_btn(num, page_num, num_pages));
                    }
                });

                pagination.append(create_page_btn('Next', page_num, num_pages));
                pagination.append(create_page_btn('Last', page_num, num_pages));
                
            } else if(page_num === num_pages) {
                pagination.append(create_page_btn('First', page_num, num_pages));
                pagination.append(create_page_btn('Previous', page_num, num_pages));

                nums.forEach(num => {
                    
                    if(num === page_num - 2 || num === page_num - 1 || num === page_num) {
                        // console.log(page_num-1)
                        // console.log(page_num-2)
                        pagination.append(create_page_btn(num, page_num, num_pages));
                        
                    }
                });
            } else {
                pagination.append(create_page_btn('First', page_num, num_pages));
                pagination.append(create_page_btn('Previous', page_num, num_pages));

                nums.forEach(num => {
                    // console.log('out')
                    if(num === page_num - 1 || num === page_num || num === page_num + 1) {
                        pagination.append(create_page_btn(num, page_num, num_pages));
                        // console.log('in')
                    }
                });

                pagination.append(create_page_btn('Next', page_num, num_pages));
                pagination.append(create_page_btn('Last', page_num, num_pages));
            }
            

            postView.append(element);
        }

    })
}

function create_page_btn(page, page_num, num_pages) {
    const page_btn = document.createElement('li')
    if(page === page_num) {
        page_btn.className = 'page-item active';
    } else {
        page_btn.className = 'page-item';
    }
    
    const num = 
        page === 'First' ? 1
        : page === 'Previous' ? page_num - 1
        : page === 'Next' ? page_num + 1
        : page === 'Last' ? num_pages
        : page;
    
    page_btn.innerHTML = `
        <a class="page-btn page-link small" aria-label="${page}" data-page="${num}">
            <span aria-hidden="true">${page}</span>
            <span class="sr-only">${page}</span>
        </a>
    `;
    return page_btn
}

function new_post(post) {
    const element = document.createElement('div');
    element.id = post.id
    element.className = 'post border rounded px-3 py-3 my-2';

    const edit = post.editable ? `<span class="edit-btn btn btn-sm btn-link">Edit</span>` : '';
    const heart = post.liked ? `<i class="unlike-btn fa fa-heart"></i>` : `<i class="like-btn fa fa-heart-o"></i>`;

    element.innerHTML = `
        <div class="media">
            <img src="${post.img_url}" class="show-profile post-img rounded-circle mr-3" width="50px" height="50px" data-user-id="${post.user_id}">
            <div class="media-body">
                <div class="post-head d-flex justify-content-between align-items-end">
                    <strong class="show-profile" data-user-id="${post.user_id}">${post.posted_by}</strong>
                    ${edit}
                </div>
                <p class="small text-muted">${post.timestamp}</p>
            </div>
        </div>
        <div class="post-body">
            <p>${post.content}</p>
            <span>${heart}</span> 
            <span>${post.likes}</span>
        </div>
    `;

    if(!post.user_logged_in) {
        element.querySelector('.fa').classList.add('disabled')
    }
    
    return element;
    // postContainer.append(element);
}

function edit_post(post_id) {
    
    fetch(`edit/${post_id}`)
    .then(response => response.json())
    .then(data => {
        const post = data[0];
        const post_body = document.getElementById(post_id).children[1];

        post_body.innerHTML = `
            <textarea class="post-content" style="width: 100%">${post.content}</textarea>
            <input class="update-btn btn btn-info btn-sm" type="submit" value="Save">
        `;
    })
}

function update_post(post_id) {
    const content = document.querySelector('.post-content').value

    fetch(`edit/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        const post = data[0];
        const old_post = document.getElementById(post_id);
        // console.log(post.content)

        postView.replaceChild(new_post(post), old_post);
    })
}

function toggle_like(post_id, is_liked) {
    console.log(is_liked)


    const post_body = document.getElementById(post_id).children[1];
    // const post_like = post_body.querySelector 
    // console.log(typeof post_body.children[1])
    // console.log(typeof postView)


    fetch(`edit/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            like: !is_liked
        })
    })
    .then(response => response.json())
    .then(data => {
        // if(data[0] === 'login') {
        //     fetch('login')
        // }
        const post = data[0];
        // console.log(post.liked)

        const likes = document.createElement('span');
        const btn = document.createElement('span');
        likes.innerHTML = `${post.likes}`;

        if(post.liked) {
            btn.innerHTML = `<i class="unlike-btn fa fa-heart"></i>`;
            post_body.replaceChild(btn, post_body.children[1]);
            post_body.replaceChild(likes, post_body.children[2])
        } else {
            btn.innerHTML = `<i class="like-btn fa fa-heart-o"></i>`;
            post_body.replaceChild(btn, post_body.children[1]);
            post_body.replaceChild(likes, post_body.children[2])
        }
        // const old_post = document.getElementById(post_id);
        // // console.log(post.content)

        // postContainer.replaceChild(new_post(post), old_post);
    })
}

function toggle_follow(user_id, is_following) {
    
    fetch(`profile/${user_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            follow: !is_following
        })
    })
    .then(response => response.json())
    .then(data => {
        const profile = data[0];

        const element = document.querySelector('.profile-content');
        const followers_num = element.children[1].children[3];
        followers_num.innerHTML = profile.followers_num;

        const old_follow_btn = element.children[0].children[0];
        const new_follow_btn = document.createElement('span')
        new_follow_btn.innerHTML = profile.is_following ? 
            `<a class="unfollow-btn btn btn-info btn-sm">
                <i class="fa fa-check-circle" aria-hidden="true"></i> Following
            </a>` :
            `<a class="follow-btn btn btn-outline-info btn-sm">
                <i class="fa fa-user-circle-o" aria-hidden="true"></i> Follow
            </a>` ;
        element.children[0].replaceChild(new_follow_btn, old_follow_btn);
    })
}