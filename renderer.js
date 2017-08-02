// This file is required by the index.html file and will be executed in the renderer 
// process for that window. All of the Node.js APIs are available in this process.

function notificationTest() {
    let myNotification = new Notification('Title', {
      body: 'Lorem Ipsum Dolor Sit Amet'
    })

    myNotification.onclick = () => {
      console.log('Notification clicked')
    }
}

// This bit of jQuery listens for the button click then executes it!
document.querySelector('#testButton').addEventListener('click', clickTest);
