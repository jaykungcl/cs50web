document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send mail
  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();

    send_email();
    load_mailbox('sent');
  })

  // By default, load the inbox
  load_mailbox('inbox');
});

// Go back via history
window.onpopstate = function(e) {
  if(e.state.mailbox === 'new') {
    compose_email();
  } else if (e.state.mailbox === 'inbox' || e.state.mailbox === 'sent' || e.state.mailbox === 'archive') {
    load_mailbox(e.state.mailbox);
  } else {
    view_email(e.state.mailbox);
  }
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Push state and set url
  if(!history.state || history.state.mailbox !== mailbox) {
    history.pushState({mailbox:'new'}, '', 'new');
  }
}

function reply_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail').style.display = 'none';

  // Set composition fields
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n`;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Push state and set url
  if(!history.state || history.state.mailbox !== mailbox) {
    history.pushState({mailbox: mailbox}, '', `${mailbox}`);
  }

  // Get mails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Create element for all emails
    const element = document.createElement('div');
    element.classList.add('list-group');
    element.id = 'mailbox'
    document.querySelector('#emails-view').append(element)

    // Add each email to DOM
    emails.forEach(email => {
      add_email(email, mailbox);
    });

    // Addeventlistener to each mail and archive button
    document.querySelectorAll('.mail').forEach(mail => {
      mail.addEventListener('click', (e) => {
        if(e.target.className.includes('archive_btn')) {
          // Archive
          toggle_archive(mail.id, true);
          e.target.parentElement.parentElement.parentElement.remove();
        } else if(e.target.className.includes('archive_remove_btn')) {
          //Unarchive
          toggle_archive(mail.id, false);
          e.target.parentElement.parentElement.parentElement.remove();
        } else {
          // Open mail and set as read
          mark_as_read(mail.id);
          view_email(mail.id);
        }
      })
    })
  })
  .catch(error => console.log(error))
}

function send_email() {
  
  // Assign input from user to variable
  const recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  
  // Set default if no subject
  if(subject === '') {
    subject = 'No Subject'
  }
  const body = document.querySelector('#compose-body').value;
  
  // POST methos to send email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
  .catch(error => console.log(error))
}

function add_email(email, mailbox) {

  const element = document.createElement('div');
  element.className = 'mail list-group-item list-group-item-action';
  element.id = email.id;

  // Add read class if read
  if(email.read === true) {
    element.classList.add('read')
  }

  // Append email info to DOM
  const content = document.createElement('div');
  content.className = 'row align-items-center';
  element.append(content)

  const sender = document.createElement('div');
  sender.innerHTML = `<strong>${email.sender}</strong>`;
  sender.className = 'col-3';

  const subject = document.createElement('div');
  subject.innerHTML = email.subject;
  subject.className = 'col-5';

  const timestamp = document.createElement('div');
  timestamp.innerHTML = email.timestamp;
  timestamp.className = 'col-3 small text-muted';

  content.append(sender)
  content.append(subject)
  content.append(timestamp)

  // Add archive/unarchive icon to DOM
  if(mailbox === 'inbox') {
    const archive_btn = document.createElement('div')
    archive_btn.innerHTML = `<i class="archive_btn fa fa-archive"></i>`;
    archive_btn.className = 'col';
    content.append(archive_btn)

  } else if(mailbox === 'archive') {
    const archive_btn = document.createElement('div')
    archive_btn.innerHTML = `<i class="archive_remove_btn fa fa-minus-circle"></i>`;
    archive_btn.className = 'col';
    content.append(archive_btn)
  }

  document.querySelector('#mailbox').append(element)
}

function view_email(id) {

  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'block';

  // Push state and set url
  if(!history.state || history.state.mailbox !== id) {
    history.pushState({mailbox: id}, '', `email${id}`);
  }

  // Get email info
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email => {

    document.querySelector('#detail-sender').innerHTML = email.sender
    document.querySelector('#detail-recipients').innerHTML = email.recipients
    document.querySelector('#detail-subject').innerHTML = email.subject
    document.querySelector('#detail-timestamp').innerHTML = email.timestamp
    document.querySelector('#detail-body').innerHTML = email.body

    // Add eventlistener to reply button
    document.querySelector('#reply').addEventListener('click', () => {
      reply_email(email);
    })
  })
  .catch(error => console.log(error))
}

function mark_as_read(id) {
  
  // Update read with PUT method
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .then(result => console.log(result))
  .catch(error => console.log(error))
}


function toggle_archive(id, val) {

  // Update archive with PUT method
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: val
    })
  })
  .then(result => console.log(result))
  .catch(error => console.log(error))
}