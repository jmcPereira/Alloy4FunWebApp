/**
 * Created by josep on 17/08/2016.
 */

Template.frameNavigation.helpers({

});

Template.frameNavigation.events({
    'click #nextFrame.enabled' : function(){
        var type = $(".framePickerTarget")[0].value;
        currentFramePosition[type]++;
        if(currentFramePosition[type]==lastFrame(type)){
            $("#nextFrame.enabled").removeClass("enabled");
        }
        $("#previousFrame").addClass("enabled");
        $(".current-frame").html(currentFramePositionToString());
        savePositions();
        project();
    },
    'click #previousFrame.enabled' : function(){
        var type = $(".framePickerTarget")[0].value;
        currentFramePosition[type]--;
        if(currentFramePosition[type]==0){
            $("#previousFrame.enabled").removeClass("enabled");
        }
        $("#nextFrame").addClass("enabled");
        $(".frame-position").html(currentFramePositionToString());
        savePositions();
        project();
    },
    'change .framePickerTarget' : function(event){
        var selectedType = event.target.value;
        var currentAtom = currentFramePosition[selectedType];
        $("#nextFrame").addClass("enabled");
        $("#previousFrame").addClass("enabled");
        if(currentAtom == lastFrame(selectedType))$("#nextFrame").removeClass("enabled");
        if(currentAtom == 0)$("#previousFrame").removeClass("enabled");
    }
});

Template.frameNavigation.onRendered(function(){
    $(".frame-navigation").hide();
});

lastFrame = function(type){
  return allAtoms.nodes("[type='"+type+"']").length-1;
};