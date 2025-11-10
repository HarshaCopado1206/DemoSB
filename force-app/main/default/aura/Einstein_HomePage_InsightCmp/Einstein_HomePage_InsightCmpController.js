({
    toggleDetails: function(component, event, helper) {
        var cmpTarget = component.find('toggleDetails');
        $A.util.toggleClass(cmpTarget, 'expanded');
   },
   doInit: function(component, event, helper) {
       document.addEventListener('updateEinstein',()=>{
           component.set('v.poNumber','9');
       })
   }
    
})