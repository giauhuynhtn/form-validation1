// Constructor function
const Validator = (options) => {
    const getParent = (element, selector) => {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }

    }

    let selectorRules = {};

    // Validate function
    const validate = (inputElement, rule) => {
        const parentElement = getParent(inputElement, options.formGroupSelector);
        const errorElement = parentElement.querySelector(options.errorSelector);
        let errorMessage;

        // get rules of selector
        let rules = selectorRules[rule.selector]

        // loop in rules and check, if there is error message => stop check
        for (let i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':      
                    errorMessage =rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );

                    break;
                default:
                    errorMessage =rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

            if (errorMessage) {
                errorElement.innerText = errorMessage
                parentElement.classList.add('invalid')
            } else {
                errorElement.innerText = ''
                parentElement.classList.remove('invalid')
            }
        return !errorMessage
    }

    // get form element that needs validated
    const formElement = document.querySelector(options.form);

    if (formElement) {

        // when submit form
        formElement.onsubmit = (e) => {
            e.preventDefault();

            let isFormValid = true;

            // Loop through each rule and validate
            options.rules.forEach(rule => {
                const inputElement = formElement.querySelector(rule.selector);
                let isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                }
            });  
            
            
            if (isFormValid) {
                // Submit with javascript
                if (typeof options.onSubmit === 'function') {
                    let enableInputs = formElement.querySelectorAll('[name]');
                    let formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'radio':
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = '';
                                    } 
                                    return values
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
                // Submit with default settings
                else {
                    formElement.submit()
                }
            }
        }

        // Loop through each rule and validate (listen blur event/input event/... )
        options.rules.forEach(rule => {

            // store rules of each input element
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            const inputElements = formElement.querySelectorAll(rule.selector);
            
            Array.from(inputElements).forEach((inputElement) => {
                // handle when blur out of input
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                }
    
                // handle when user is typing input
                inputElement.oninput = () => {
                    getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector).innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }

                // handle when user select wrong option of city
                inputElement.onchange = () => {
                    validate(inputElement, rule);
                }
            })
        })
    }
}

//  Define rules
// 1. when has error => return error message
// 2. when has no error => return undefined
Validator.isRequired = (selector) => {
    return {
        selector: selector,
        test: (value) => {
            return value ? undefined : 'Please fill in this field'
        }
    }
}

Validator.isEmail = (selector) => {
    return {
        selector: selector,
        test: (value) => {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Please fill in an email'
        }
    }
}

Validator.minLength = (selector, min) => {
    return {
        selector: selector,
        test: (value) => {
            return value.length >= min ? undefined : `Password should be at least ${min} characters`
        }
    }
}

Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || 'Please fill in again. Value is not correct'
        }
    }
}