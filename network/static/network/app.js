const postView = document.querySelector('#posts-view');
const profileView = document.querySelector('#profile-view');
const formView = document.querySelector('#form-view');
const modal = document.querySelector('#deleteModal');
const updateProfileView = document.querySelector('#update-profile-view');


document.addEventListener('DOMContentLoaded', () => {

    // Add click event listener to elements on page after finish loading
    document.addEventListener('click', e => {
        
        const post = e.target.closest('.post');

        // Look for edit btn
        if(e.target.classList.contains('edit-post-btn')) {
            e.target.classList.add('disabled');
            edit_post(post.id);

        // Look for update post btn
        } else if(e.target.classList.contains('update-post-btn')) {
            update_post(post.id);

        // Look for cancel update post tbn
        } else if(e.target.classList.contains('cancel-update-post-btn')) {
            post.querySelector('.edit-post-btn').classList.remove('disabled');
            cancel_update_post(post.id);

        // Look for like btn
        } else if(e.target.classList.contains('like-btn') && !e.target.classList.contains('disabled')) {
            toggle_like(post.id, false);

        // Look for unlike btn
        } else if(e.target.classList.contains('unlike-btn') && !e.target.classList.contains('disabled')) {
            toggle_like(post.id, true);

        // Look for profile pics/name
        } else if(e.target.classList.contains('show-profile') || e.target.parentElement.classList.contains('show-profile')) {
            // Get user id from data attribute
            user_id = e.target.dataset.userId ? e.target.dataset.userId: e.target.parentElement.dataset.userId;
            get_profile(user_id);
            get_posts(user_id, 1);

        // Look for edit profile btn
        } else if(e.target.classList.contains('edit-profile-btn') || e.target.parentElement.classList.contains('edit-profile-btn')) {
            user_id = e.target.closest('.media').dataset.userId;
            edit_profile(user_id);

        // If update profile btn clicked request will be sent via form and process in index view

        // Look for cancel update profile btn
        } else if(e.target.classList.contains('cancel-update-profile-btn')) {
            /////////////
            user_id = e.target.closest('.media').dataset.userId;
            cancel_update_profile(user_id);

        // Look for follow btn
        } else if(e.target.classList.contains('follow-btn') || e.target.parentElement.classList.contains('follow-btn')) {
            user_id = e.target.closest('.media').dataset.userId;
            toggle_follow(user_id, false);

        // Look for unfollow btn
        } else if(e.target.classList.contains('unfollow-btn') || e.target.parentElement.classList.contains('unfollow-btn')) {
            user_id = e.target.closest('.media').dataset.userId;
            toggle_follow(user_id, true);

        // Look for following view btn
        } else if(e.target.classList.contains('following-view')) {
            get_posts('following', 1);

        // Look for page change btn
        } else if(e.target.classList.contains('page-btn') || e.target.parentElement.classList.contains('page-btn')) {
            const page_num = e.target.dataset.page ? e.target.dataset.page: e.target.parentElement.dataset.page;
            get_posts(postView.className, page_num);

        // Look for post delete button
        } else if(e.target.classList.contains('delete-btn')) {
            let post_id = post.id;

            // Delete post if confirm delete button was clicked
            modal.onclick = e => {
                if(e.target.classList.contains('confirm-delete-btn')) {
                    delete_post(post_id);
                }
            }
        }
    });

    // Default: get first page of all posts
    get_posts('all', 1);
})


// Listen to popstate event (go back)
window.onpopstate = e => {
    if(e.state) {
        get_posts(e.state.page, e.state.page_num);
    }
}


function get_profile(user_id) {
    profileView.innerHTML = '';

    // Request profile's data
    fetch(`profile/${user_id}`)
    .then(response => response.json())
    .then(data => {
        const profile = data[0];

        const element = document.createElement('div');
        element.className = 'media';
        element.dataset.userId = `${profile.id}`

        let btn = '';

        // Check if user can be followed
        if(profile.user_logged_in && profile.not_user) {
            // Add follow/unfollow btn
            btn = profile.is_following ? 
                `<a class="unfollow-btn btn btn-info btn-sm">
                    <i class="fa fa-check-circle" aria-hidden="true"></i> Following
                </a>` :
                `<a class="follow-btn btn btn-outline-info btn-sm">
                    <i class="fa fa-user-circle-o" aria-hidden="true"></i> Follow
                </a>` ;
        } else if(profile.user_logged_in) {
            // Add edit profile btn
            btn = `
                <a class="edit-profile-btn btn btn-outline-secondary btn-sm">
                    <i class="fa fa-pencil" aria-hidden="true"></i> Edit Profile
                </a>
            `;
        } else {
            btn = `<input class="btn btn-sm hidden">`;
        }

        element.innerHTML = `
            <img class="img-thumbnail rounded-circle ml-sm-5 ml-0 my-2" src="${profile.img_url}" width="150px" height="150px">
            <div class="media-body pl-3">
                <div class="d-flex justify-content-end">
                    <span>${btn}</span>
                </div>
                <div id="profile-content" class="pl-sm-4 pl-1">
                    <h1 class="my-3">${profile.username}</h1>
                    <span>${profile.following_num} </span>
                    <span class="small text-muted">Following</span>
  
                    <span>${profile.followers_num} </span>
                    <span class="small text-muted">Followers</span>
                </div>
            </div>
        `;

        profileView.append(element);
    })
    .catch(err => console.log(err));
}


function edit_profile(user_id) {

    // Get inner HTML of update profile view to show
    const element = profileView.querySelector('#profile-content');

    element.innerHTML = updateProfileView.innerHTML;
}


function cancel_update_profile(user_id) {

    // Get old user'profile info to shoe profile view
    fetch(`profile/${user_id}`)
    .then(response => response.json())
    .then(data => {
        const profile = data[0];
        const element = profileView.querySelector('#profile-content');
        
        element.innerHTML = `
            <h1 class="my-3">${profile.username}</h1>
            <span>${profile.following_num} </span>
            <span class="small text-muted">Following</span>

            <span>${profile.followers_num} </span>
            <span class="small text-muted">Followers</span>
        `;
    })
}


function get_posts(page, page_num) {
    page_num = parseInt(page_num);
    postView.className = page;
    postView.dataset.pageNum = page_num;

    if(page === 'all') {
        formView.style.display = 'block';
        profileView.style.display = 'none';
        postView.innerHTML = `<h3 class="mt-3">All Posts</h3>`;

    } else if(page === 'following') {
        formView.style.display = 'block';
        profileView.style.display = 'none';
        postView.innerHTML = `<h3 class="mt-3">Following</h3>`;

    } else {
        formView.style.display = 'none'; 
        profileView.style.display = 'block';
        postView.innerHTML = `<h3 class="mt-3">Posts</h3>`;
    }

    // Get posts according to requested page & page number
    fetch(`posts/${page}/${page_num}`)
    .then(response => response.json())
    .then(data => {
        // Posts sent back via JSON response
        const posts = data.posts;

        // Number of total pages
        const num_pages = data.num_pages;

        // Username of profile's user
        const profile_name = data.profile_name;

        posts.forEach(post => {
            postView.append(new_post(post));
        });

        // Push state to history and set URL
        if(!history.state || (history.state.page !== page || history.state.page_num !== page_num)) {
            if(page === 'all') {
                history.pushState({'page': page, 'page_num': page_num}, '', '');
            } else if(page === 'following') {
                history.pushState({'page': page, 'page_num': page_num}, '', 'following');
            } else {
                history.pushState({'page': page, 'page_num': page_num}, '', `${profile_name}`);
            }
        }

        // If no post sent back via JSON response
        if(Object.keys(posts).length === 0){
            const element = document.createElement('div');
            element.className = 'text-center text-muted my-5'
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

        // Add pagination if there is more than one page
        if(num_pages > 1) {
            const element = document.createElement('nav');
            element.innerHTML = `
                <ul class="pagination justify-content-end"></ul>
            `;

            const pagination = element.children[0];

            // Create array of int from 1 to last page number
            const nums = [...Array(num_pages).keys()].map(num => num + 1);

            // Case on first page
            if(page_num === 1) {

                nums.forEach(num => {
                    if(num === page_num || num === page_num + 1 || num === page_num + 2) {
                        pagination.append(create_page_btn(num, page_num, num_pages));
                    };
                });
                pagination.append(create_page_btn('Next', page_num, num_pages));
                pagination.append(create_page_btn('Last', page_num, num_pages));
                
            // Case on last page
            } else if(page_num === num_pages) {
                pagination.append(create_page_btn('First', page_num, num_pages));
                pagination.append(create_page_btn('Previous', page_num, num_pages));

                nums.forEach(num => {
                    if(num === page_num - 2 || num === page_num - 1 || num === page_num) {
                        pagination.append(create_page_btn(num, page_num, num_pages));        
                    };
                });

            } else {
                pagination.append(create_page_btn('First', page_num, num_pages));
                pagination.append(create_page_btn('Previous', page_num, num_pages));

                nums.forEach(num => {
                    if(num === page_num - 1 || num === page_num || num === page_num + 1) {
                        pagination.append(create_page_btn(num, page_num, num_pages));
                    }
                });
                pagination.append(create_page_btn('Next', page_num, num_pages));
                pagination.append(create_page_btn('Last', page_num, num_pages));
            };

            postView.append(element);
        };

    })
    .catch(err => console.log(err))
}

// Create and return page-btn element
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

// Create and return individual post element
function new_post(post) {
    const element = document.createElement('div');
    element.id = post.id
    element.className = 'post border rounded px-3 py-3 my-2';

    const edit = post.editable ? `<span class="edit-post-btn btn btn-sm btn-link">Edit</span>` : '';
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

    // Disable like btn if user not logged in
    if(!post.user_logged_in) {
        element.querySelector('.fa').classList.add('disabled')
    };
    
    return element;
}


function edit_post(post_id) {
    fetch(`edit/${post_id}`)
    .then(response => response.json())
    .then(data => {
        const post = data[0];
        const post_body = document.getElementById(post_id).children[1];

        // Change DOM element to edit post view
        post_body.innerHTML = `
            <textarea class="post-content mb-1" style="width: 100%">${post.content}</textarea>
            <div class="d-flex justify-content-between">
                <div>
                    <button class="update-post-btn btn btn-info btn-sm mr-2">Save</button>
                    <button class="cancel-update-post-btn btn btn-secondary btn-sm">Cancel</button>
                </div>
                <button class="delete-btn btn btn-outline-danger btn-sm" data-toggle="modal" data-target="#deleteModal">Delete</button>
            </div>
        `;
    })
}


function update_post(post_id) {
    const content = document.querySelector('.post-content').value

    // PUT request to update edited post
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

        postView.replaceChild(new_post(post), old_post);
    })
    .catch(err => console.log(err));
}


function cancel_update_post(post_id) {
    fetch(`edit/${post_id}`)
    .then(response => response.json())
    .then(data => {
        const post = data[0];
        const post_body = document.getElementById(post_id).children[1];
        const heart = post.liked ? `<i class="unlike-btn fa fa-heart"></i>` : `<i class="like-btn fa fa-heart-o"></i>`;

        // Change DOM element to normal post view
        post_body.innerHTML = `
            <p>${post.content}</p>
            <span>${heart}</span> 
            <span>${post.likes}</span>
        `;
    })
}


function toggle_like(post_id, is_liked) {
    const post_body = document.getElementById(post_id).children[1];

    // PUT request to update like status of post
    fetch(`edit/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            like: !is_liked
        })
    })
    .then(response => response.json())
    .then(data => {
        const post = data[0];

        const likes = document.createElement('span');
        const btn = document.createElement('span');
        likes.innerHTML = `${post.likes}`;

        // Update like btn and number of likes on DOM
        if(post.liked) {
            btn.innerHTML = `<i class="unlike-btn fa fa-heart"></i>`;
            post_body.replaceChild(btn, post_body.children[1]);
            post_body.replaceChild(likes, post_body.children[2])
        } else {
            btn.innerHTML = `<i class="like-btn fa fa-heart-o"></i>`;
            post_body.replaceChild(btn, post_body.children[1]);
            post_body.replaceChild(likes, post_body.children[2])
        }
    })
    .catch(err => console.log(err));
}

function toggle_follow(user_id, is_following) {
    
    // PUT request to update follow status
    fetch(`profile/${user_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            follow: !is_following
        })
    })
    .then(response => response.json())
    .then(data => {
        const profile = data[0];

        const element = profileView.querySelector('.media-body');
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
            </a>`;

        element.children[0].replaceChild(new_follow_btn, old_follow_btn);
    })
    .catch(err => console.log(err));
}

function delete_post(post_id) {

    // Send delete request
    fetch(`edit/${post_id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);

        get_posts(postView.className, postView.dataset.pageNum);
    })
    .catch(err => console.log(err));
}