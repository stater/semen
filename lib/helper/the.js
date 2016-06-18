'use strict';

class The {
    constructor(object) {
        this.type = typeOf(object);
        this.object = object;
    }

    // METHODS.
    is(types) {
        // Use single check if the types is string.
        if ('string' === typeof types) {
            return this.type === types;
        }

        // Use multiple check if the types is array.
        else if (Array.isArray(types)) {
            // Set the correct to false.
            let correct = false;

            // Iterate the types to check the object type.
            types.forEach(type => {
                // Set the correct to true if the type is equal to this type.
                if (this.type === type) correct = true;
            });

            // Return the correct.
            return correct;
        }
    }

    isnot(type) {
        // Use negation of .is().
        return this.is(type) === false;
    }

    like(target) {
        // Check does this type is equal to the target type.
        return this.type === typeOf(target);
    }

    unlike(target) {
        // Use negation of .like().
        return this.like(target) === false;
    }

    eq(data) {
        if ('string' === typeof data || 'number' === typeof data) {
            return this.like(data) && this.object === data;
        } else if (Array.isArray(data)) {
            let correct = false;

            data.forEach(dt => {
                if (this.like(dt) && this.object === dt) {
                    correct = true;
                }
            });

            return correct;
        }
    }

    ineq(data) {
        return this.eq(data) === false;
    }
}

function the(object) {
    return new The(object);
}

function typeOf(object) {
    return toString.call(object).replace(/(\[object\s+)|(\])/g, '').toLowerCase();
}

module.exports = the;
