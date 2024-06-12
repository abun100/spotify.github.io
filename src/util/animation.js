
function changeCenter() {
  let isDragging = false;
  let dragStartAngle = 0.0;
  let wheel_theta = 0.0;
  const wheel = document.querySelector('.wheel');
  const imgContainer = document.querySelector('.imageContainer');
  const img_item = document.querySelectorAll('.image-item');
  
  function resize() {
    //Center of the container
    const centerPos = {
      x: imgContainer.clientWidth / 2,
      y: imgContainer.clientHeight / 2
    }
    
    let theta = (36 * Math.PI) / 180;
    let new_theta = 0.0;
    let newX = 0.0;
    let newY = 0.0;
    let wheelRaidus = 275.0;

    img_item.forEach((image, index) => {
      new_theta = theta * index;
      newX =  Math.cos(new_theta) * wheelRaidus;
      newY = (-1.0 * Math.sin(new_theta)) * wheelRaidus;
      image.style.left = centerPos.x + newX + 'px';
      image.style.top = centerPos.y + newY + 'px';

      // Add touch event listeners to each image
      image.addEventListener('touchstart', startDragging);
      image.addEventListener('touchmove', rotateImage);
      image.addEventListener('touchend', stopDragging);
    });
  }


  //Add an event listener for resizing the page
  window.addEventListener('resize', resize);
  //Initially position our wheel
  resize();

  imgContainer.addEventListener('wheel', event => {
      let scrollSpeed = event.deltaY * 0.125;
      wheel_theta = wheel_theta + scrollSpeed;
      wheel.style.transform = `translate(-50%,-50%) rotate(${wheel_theta + scrollSpeed}deg)`;

      img_item.forEach((image) => {
        image.style.transform = `translate(-50%,-50%) rotate(${0-(wheel_theta + scrollSpeed)}deg)`;
      })
  });


  const centerPos = {
    x: imgContainer.clientWidth / 2,
    y: imgContainer.clientHeight / 2
  }
  
  function startDragging(event) {
    isDragging = true;
    const touch = event.touches[0];
    dragStartAngle = Math.atan2(
      touch.clientY - centerPos.y,
      touch.clientX - centerPos.x
    );
  }

  function rotateImage(event) {
    if (isDragging) {
      const touch = event.touches[0];
      const dragCurrentAngle = Math.atan2(
        touch.clientY - centerPos.y,
        touch.clientX - centerPos.x
      );
      const angleDiff = dragCurrentAngle - dragStartAngle;
      wheel_theta += (angleDiff * 180) / Math.PI;
      wheel.style.transform = `translate(-50%, -50%) rotate(${wheel_theta}deg)`;
      img_item.forEach((image) => {
        image.style.transform = `translate(-50%, -50%) rotate(${
          0 - wheel_theta
        }deg)`;
      });
      dragStartAngle = dragCurrentAngle;
    }
  }

  function stopDragging() {
    isDragging = false;
  }
}
// Call the function when the DOM is ready
document.addEventListener('DOMContentLoaded', changeCenter);
