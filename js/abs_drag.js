// $('abs_checker').on("mousedown",function(me){
//     var move = $(this);
    
//     var lastOffset = move.data('lastTransform');
//     var lastOffsetX = lastOffset ? lastOffset.dx : 0,
//         lastOffsetY = lastOffset ? lastOffset.dy : 0;
         
//     var startX = me.pageX - lastOffsetX, startY = me.pageY - lastOffsetY;
    
//     $(document).on("mousemove",function(e){
//         var newDx = e.pageX - startX,
//             newDy = e.pageY - startY;
//         console.log("dragging", e.pageX-startX, e.pageY-startY);
//         move.css('transform', 'translate(' + newDx + 'px, ' + newDy + 'px)');
        
//         // we need to save last made offset
//         move.data('lastTransform', {dx: newDx, dy: newDy});
//     });
// });
// $(document).on("mouseup",function(){
//     $(this).off("mousemove");
// });


// It works
(function() {
    let movingChecker = null;

    // Start dragging
     function dragstart(e) {
        // Set the movingChecker object
        movingChecker = e.target;
    };

    document.addEventListener('dragstart', dragstart, false)


    //dragover event to allow the drag by preventing its default
    //ie. the default action of an element is not to allow dragging 
    document.addEventListener('dragover', function(e) {
        if(movingChecker)
        {
            e.preventDefault();
        }
    
    }, false);  

    //drop event to allow the element to be dropped into valid targets
    document.addEventListener('drop', function(e) {
        //if this element is a drop target, move the movingChecker here 
        //then prevent default to allow the action (same as dragover)
        if (e.target.classList.contains('field')) {
            e.target.appendChild(movingChecker); 
            e.preventDefault();
        }
    }, false);
    
    //dragend event to clean-up after drop or abort
    //which fires whether or not the drop target was valid
    document.addEventListener('dragend', function(e) {
        movingChecker = null;
    }, false);
})();




// let abs_checker = document.querySelectorAll('abs_checker')
// abs_checker.onmousedown = function(event) {

//     // move it out of any current parents directly into body
//     // to make it positioned relative to the body
//     document.body.append(abs_checker);
  
//     // centers the abs_checker at (pageX, pageY) coordinates
//     function moveAt(pageX, pageY) {
//         abs_checker.style.left = pageX - abs_checker.offsetWidth / 2 + 'px';
//         abs_checker.style.top = pageY - abs_checker.offsetHeight / 2 + 'px';
//     }
  
//     // move our absolutely positioned abs_checker under the pointer
//     moveAt(event.pageX, event.pageY);
  
//     function onMouseMove(event) {
//       moveAt(event.pageX, event.pageY);
//     }
  
//     // (2) move the abs_checker on mousemove
//     document.addEventListener('mousemove', onMouseMove);
  
//     // (3) drop the abs_checker, remove unneeded handlers
//     abs_checker.onmouseup = function() {
//       document.removeEventListener('mousemove', onMouseMove);
//       abs_checker.onmouseup = null;
//     };
  
//   };

//   abs_checker.ondragstart = function() {
//     return false;
//   };
