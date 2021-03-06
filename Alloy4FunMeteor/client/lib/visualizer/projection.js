/**
 * Created by josep on 12/08/2016.
 */

currentlyProjectedTypes = [];
currentFramePosition = {};
allAtoms = [];
atomPositions = {};
//TODO caching system
// projectionCache = [];

project = function(){

    //TODO caching system
    // var projection = getProjectionFromCache();
    // if(projection)updateProjection(projection);
    // else
    Meteor.call("getProjection", Meteor.default_connection._lastSessionId,  currentFramePosition, processProjection);
};

processProjection = function(err, projection){
    if(err)console.log(err);
    else{
        /*TODO caching system
         projectionCache.push({projectedTypes : currentFramePosition, frame : projection[0]});
         */

        updateProjection(projection[0]);
    }
};

updateProjection = function(frame){
    console.log(frame);
    cy.nodes().remove();
    allAtoms.forEach(function(node){
        for(var i in frame.atoms){
            if (node.data().id == frame.atoms[i])cy.add(node);
        }
    });
    var edges = getProjectionEdges(frame.relations);
    cy.edges().remove();
    cy.add(edges);
    applyCurrentLayout();
    applyPositions();
};

addTypeToProjection = function (newType){
    if(currentlyProjectedTypes.indexOf(newType)==-1){
        currentlyProjectedTypes.push(newType);
        currentlyProjectedTypes.sort();
        currentFramePosition[newType] = 0;
        $(".frame-navigation").show();
        $(".frame-navigation > select").append($("<option></option>")
            .attr("value",newType)
            .text(newType));
    }else throw newType+ " already being projected.";
    var atoms = lastFrame(newType);
    if(atoms >1){
        $("#nextFrame").addClass("enabled");
        $("#previousFrame").removeClass("enabled");
    }
    $(".current-frame").html(currentFramePositionToString());
    $(".framePickerTarget").val(newType);
    project();
};

removeTypeFromProjection = function(type) {
    var index = currentlyProjectedTypes.indexOf(type);
    if (index == -1)throw type + " not found in types being projected.";
    else {
        currentlyProjectedTypes.splice(index, 1);
        delete currentFramePosition[type];
        $(".frame-navigation > select option[value = '" + type + "']").remove();
    }
    if (currentlyProjectedTypes.length == 0) {
        $(".frame-navigation").hide();
        var instanceNumber = Session.get("currentInstance");
        if (instanceNumber != undefined) {
            var instance = getCurrentInstance(instanceNumber);
            if (instance)updateGraph(instance);
        }
    } else {
        $(".current-frame").html(currentFramePositionToString());
        project();
    }

};

newInstanceSetup = function(){
    if(currentlyProjectedTypes.length!=0) {
        for (var key in currentFramePosition)currentFramePosition[key] = 0;
        $(".current-frame").html(currentFramePositionToString());
        allAtoms = cy.nodes();
        project();
    }
};

savePositions = function(){
    var atoms = cy.nodes();
    atoms.forEach(function(atom){
        atomPositions[atom.data().id] = jQuery.extend(true, {}, atom.position());
    });
};

applyPositions = function (){
    for(var id in atomPositions){
        var node = cy.nodes("[id='"+id+"']");
        if(node.length > 0){
            node[0].position(atomPositions[id]);

        }
    }
};

/*
 TODO caching system
 getProjectionFromCache = function (typesToProject){
 for(var i in projectionCache)
 if(projectionCache[i].projectedTypes.equals(typesToProject))return projectionCache[i].frames;
 return undefined;
 };

 cacheProjectionState = function(){

 };

 isProjectionCached = function (typesToProject){
 for(var i in projectionCache)
 if(projectionCache[i].projectedTypes.equals(typesToProject))return true;
 return false;
 };*/


getProjectionEdges = function(relations){
    var result = [];
    relations.forEach(function (relation){
        if(relation.relation != "Next" && relation.relation != "First") {
            for (var i = 0; i < relation.tuples.length; i += relation.arity) {
                var tuple = [];
                for (var j = i; j < relation.arity + i; j++)tuple.push(relation.tuples[j]);
                var tempTuple = tuple.slice(0);
                var labelExt = tuple.splice(1, tuple.length - 2).toString();
                tuple = tempTuple;
                result.push({
                    group: "edges", selectable: true, data: {
                        relation: relation.relation,
                        source: tuple[0],
                        target: tuple[tuple.length - 1],
                        label: getRelationLabel(relation.relation),
                        color: getRelationColor(relation.relation),
                        labelExt: labelExt,
                        updatedLabelExt: labelExt,
                        edgeStyle: getRelationEdgeStyle(relation.relation)
                    }
                });
            }
        }
    });
    return result;
};


currentFramePositionToString = function(){
    var position = [];
    for(var key in currentFramePosition)position.push(key+currentFramePosition[key]);
    return position.toString();
};

