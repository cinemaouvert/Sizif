/**
 * @file manage the context menu event
 * The context menu must be removed manually using the ContextMenu.remove method
 * @todo think about adding callback functions to allow the autoremove
 * @todo créer une zone de raccourci
 * @author Yohann Vioujard
 */

(function(){
  ContextMenu = {};
  ContextMenu.visible = false;
  ContextMenu.target; // The html element targeted by the context menu.
  var setting = [];

  util.addEvent(document, "contextmenu", oncontextmenu);
  util.addEvent(document, "mousedown", onmousedown);
  //util.addEvent(document, "mouseup", onmouseup); //AUTOREMOVE

  function oncontextmenu(event){
    var target = event.target || event.srcElement;

    if(target["className"] == "list" || util.hasParent(target, "className", "list")){
      ContextMenu.target = target;

      // On empeche le comportement par d�faut
      event.returnValue = false;
      if(event.preventDefault){
        event.preventDefault();
      }

      var mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
      var mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;

      create(mouseX, mouseY);
    }
  }

  function onmousedown(event){
    var target = event.target || event.srcElement;

    if(ContextMenu.visible && target != ContextMenu.dom && !util.hasParent(target, ContextMenu.dom)){
      ContextMenu.remove();
    }

    // We prevent the buttons to the context menu to be selected
    if(target.className == "list-btnContextMenu"){
      event.returnValue = false;
      if(event.preventDefault){
        event.preventDefault();
      }
    }
  }

  //AUTOREMOVE
  /*
  function onmouseup(event){
    if(ContextMenu.visible){
      var target = event.target || event.srcElement;

      if(target.className == "list-btnContextMenu"){
        for(var i = 0; i < setting.length; i++){
          if(ContextMenu.target == setting[i].target || util.hasParent(ContextMenu.target, setting[i].target)){
            ContextMenu.remove();
          }
        }
      }
    }
  }
  */

  /**
   * create the context menu
   * @function create
   */
   function create(mouseX, mouseY){
     for(var i = 0; i < setting.length; i++){
       var uCanCreate = true;

       if(util.hasParent(ContextMenu.target, setting[i].target)){
         // Check if the parent isn't defined too
         for(var k = 0; k < setting.length; k++){
           if(setting[k].target == ContextMenu.target){
             uCanCreate = false;
           }else if(setting[k].target != setting[i].target
             && util.hasParent(setting[k].target, setting[i].target)
             && (util.hasParent(ContextMenu.target, setting[k].target)
             || setting[k].target == ContextMenu.target)){
             uCanCreate = false;
           }
         }
       }else if(ContextMenu.target != setting[i].target){
         uCanCreate = false;
       }

       if(uCanCreate){
        // We built the context menu
        ContextMenu.visible = true;

        ContextMenu.dom = document.createElement("div");
        ContextMenu.dom.className = "list-contextMenu";
        ContextMenu.dom.style.position = "fixed";
        ContextMenu.dom.style.left = mouseX + "px";
        ContextMenu.dom.style.top = mouseY + "px";
        document.body.appendChild(ContextMenu.dom);

        var btnList = setting[i].btnList
        for(var j = 0; j < btnList.length; j++){
          var newBtn = document.createElement("div");
          newBtn.className = "list-btnContextMenu";
          newBtn.setAttribute("data-translatable", true);
          newBtn.innerHTML = btnList[j];
          ContextMenu.dom.appendChild(newBtn);
        }
      }
    }
  }

  /**
   * Add a context menu setting
   * @function ContextMenu.add
   * @param {object} target - the target of the context menu
   * @param {array} btnList - string list which the describe the menu
   */
   ContextMenu.add = function(target, btnList, autoRemove){
     setting.push({target: target, btnList: btnList, autoRemove: autoRemove})
   }

  /**
   * Remove the context menu
   * @function ContextMenu.remove
   */
   ContextMenu.remove = function(){
     if(ContextMenu.visible){
       ContextMenu.visible = false;
       ContextMenu.target = "undefined";
       ContextMenu.dom.parentNode.removeChild(ContextMenu.dom);
     }
   }

   /**
    * Return the html element of the button which contains the given text
    * @function ContextMenu.btn
    * @return {object} The html element containing the text send in parameter.
    */
    ContextMenu.btn = function(string){
      if(typeof(ContextMenu.dom) != "undefined"){
        var childs = ContextMenu.dom.childNodes;
        for(var i = 0; i < childs.length; i++){
          if(childs[i].textContent == string){
            //console.log(childs[i])
            return childs[i];
          }
        }
      }else{
        return false;
      }
    }

})()
