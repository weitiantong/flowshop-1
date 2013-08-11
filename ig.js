var util = require('util');
var Flowshop = require('./flowshop');
var Helper = require('./helper');
var Timer = require('./timer');
var NEH = require('./neh');

// Iterated Greedy algorithm
function IG() {
}
util.inherits(IG, Flowshop);
exports.makespan = IG.prototype.makespan;

// Set criterion milliseconds
IG.prototype.setCriterionMilliseconds = function(ms) {
    IG.prototype.criterionMilliseconds = ms;
};
IG.prototype.criterionMilliseconds = 60;
exports.setCriterionMilliseconds = IG.prototype.setCriterionMilliseconds;

// Set T parameter by level
IG.prototype.T = Helper.T[5];
IG.prototype.setT = function(level) {
    IG.prototype.T = Helper.T[level - 1];
};
exports.setT = IG.prototype.setT;

// Set d parameter by level
IG.prototype.d = Helper.d[3];
IG.prototype.setd = function(level) {
    IG.prototype.d = Helper.d[level - 1];
};
exports.setd = IG.prototype.setd;

// NEH initialization
IG.prototype.initializationNEH = function(data) {
    return NEH.order(data);
};

// NEH initialization
IG.prototype.initializationNEH = function(data) {
    return NEH.order(data);
};

// Iterative improvement insertion
IG.prototype.iterativeImprovementInsertion = function(pi) {
    var sequence, value, minSequence, minValue, random, position;
    var pi$ = [].concat(pi);
    var piB = [].concat(pi);
    var improve = true;
    while(improve) {
        improve = false;
        sequence = [].concat(piB);
        value = Helper.makespan(sequence);
        minSequence = sequence;
        minValue = value;
        while(pi$.length > 0) {
            random = Math.floor((Math.random() * pi$.length)) + 1;
            position = Helper.position(sequence, Helper.get(pi$, random));
            for(var i = position; i < piB.length; i++) {
                sequence = Helper.toggle(sequence, i, i + 1);
                value = Helper.makespan(sequence);
                if(value < minValue) {
                    minSequence = sequence;
                    minValue = value;
                }
            }
            sequence = Helper.toggle(sequence, piB.length, 1);
            value = Helper.makespan(sequence);
            minSequence = sequence;
            minValue = value;
            for(var j = 1; j < position - 1; j++) {
                sequence = Helper.toggle(sequence, j, j + 1);
                value = Helper.makespan(sequence);
                if(value < minValue) {
                    minSequence = sequence;
                    minValue = value;
                }
            }
            if(Helper.makespan(minSequence) < Helper.makespan(piB)) {
                piB = minSequence;
                improve = true;
            }
            pi$ = Helper.remove(pi$, random);
        }
    }
    return piB;
};

// Iterated Greedy heuristic
IG.prototype.order = function(data) {
    var pi, piB, piR, pi$, pi$$, random, item, sequence, value, minSequence, minValue;
    var temperature = Helper.temperature(data, IG.prototype.T);
    var criterion = Helper.criterion(data, IG.prototype.criterionMilliseconds);

    // Initialization
    pi = IG.prototype.initializationNEH(data);
    pi = IG.prototype.iterativeImprovementInsertion(pi);
    piB = [].concat(pi);

    // Reset timer
    Timer.reset();

    // Iterate until termination criterion is satisfied
    while(Timer.diff(false) < criterion) {

        // Destruction phase
        piR = [];
        pi$ = [].concat(pi);
        for(var i = 1; i <= Math.min(IG.prototype.d, pi$.length); i++) {
            random = Math.floor((Math.random() * pi$.length)) + 1;
            item = Helper.get(pi$, random);
            pi$ = Helper.remove(pi$, random);
            piR = Helper.insertAfter(piR, piR.length, item);
        }

        // Construction phase
        for(var j = 1; j <= piR.length; j++) {
            sequence = Helper.insertBefore(pi$, 1, Helper.get(piR, j));
            value = Helper.makespan(sequence);
            minSequence = sequence;
            minValue = value;
            for(var k = 1; k < piR.length; k++) {
                sequence = Helper.toggle(sequence, j, j + 1);
                value = Helper.makespan(sequence);
                if(value < minValue) {
                    minSequence = sequence;
                    minValue = value;
                }
            }
            pi$ = minSequence;
        }

        // Local search
        pi$$ = IG.prototype.iterativeImprovementInsertion(pi$);

        if(Helper.makespan(pi$$) < Helper.makespan(pi)) {
            pi = pi$$;
            if(Helper.makespan(pi) < Helper.makespan(piB)) {
                piB = pi;
            }
        } else if(Math.random() <= Math.exp(-(Helper.makespan(pi$$) - Helper.makespan(pi)) / temperature)) {
            pi = pi$$;
        }

    }
    return piB;
};
exports.order = IG.prototype.order;
