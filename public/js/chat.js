const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const imageTemplate = document.querySelector('#image-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// socket.on('addimage', function(image){
//     console.log(image);
//     const html = Mustache.render(imageTemplate, {
//         // username: imagBas.username,
//         // image: imagBas.image,
//         // createdAt: moment(message.createdAt).format('h:mm a')
//         image: image
//     });
//     $messages.insertAdjacentHTML('beforeend', html)
// });

socket.on('addimage', function(msg,base64image){
    console.log(base64image);
    $("#messages").append($('<div class="imageWrapper">').append($('<p></p>').text(msg), '<img src="'+ base64image +'"></div>'));
    $("img").click(() => {
        console.log(base64image);
        var newTab = window.open();
        newTab.document.body.innerHTML = '<img src="'+ base64image +'" style="max-width: 500px;height: auto;">';
    });
    function scrollToBottom() {
        console.log("triggerScroll");
      let messages = document.getElementById('messages');
      messages.scrollTop = messages.scrollHeight;
    }

    scrollToBottom();
    });


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
// let closeButton = dropZoneElement.querySelector("#remove_img");


function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
  
  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);

  }

  thumbnailElement.dataset.label = file.name;
  // if (!closeButton) {
  //   $(".drop-zone__thumb").append('<div class="btn-close">X</div>');
  // }
  // Show thumbnail for image files
  // if (file.type.startsWith("image/")) {
  //   const reader = new FileReader();

  //   reader.readAsDataURL(file);
  //   reader.onload = () => {
  //     // thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
  //     thumbnailElement.style.backgroundImage = null;
  //   };
  // } else {
  //   thumbnailElement.style.backgroundImage = null;
  // }
}

$("#remove_img").click(function(e) {
    e.preventDefault();
    console.log("clickkkkk");
    $(".drop-zone").empty();
    $("#remove_img").addClass('hidden');
})

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('photo').addEventListener('change', function(e){
        var file = e.target.files[0];
        
        if(file) {
            console.log(file);
            var reader = new FileReader();
            reader.onload = function(evt){
                socket.emit('user image',evt.target.result);
            };
            reader.readAsDataURL(file);
        }
        
    });
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
      const dropZoneElement = inputElement.closest(".drop-zone");

      dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
      });

      inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
            $("#remove_img").removeClass('hidden');
        }
      });

      // dropZoneElement.addEventListener("dragover", (e) => {
      //   e.preventDefault();
      //   console.log("drop566666");
      //   dropZoneElement.classList.add("drop-zone--over");
      // });

      // ["dragleave", "dragend"].forEach((type) => {
      //   dropZoneElement.addEventListener(type, (e) => {
      //     dropZoneElement.classList.remove("drop-zone--over");
      //   });
      // });

      // dropZoneElement.addEventListener("drop", (e) => {
      //   e.preventDefault();
      //   console.log("drop1");


      //   if (e.dataTransfer.files.length) {
      //     inputElement.files = e.dataTransfer.files;
      //     console.log(inputElement.files);
      //     updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
      //     var file1 = inputElement.files[0];
      //     console.log(file1);
      //     var reader = new window.FileReader();
      //     reader.onload = function(evt){
      //       socket.emit('user image',evt.target.result);
      //     };
      //     reader.readAsDataURL(file1);
      //   }
      //   dropZoneElement.classList.remove("drop-zone--over");
      // });
    });
});

