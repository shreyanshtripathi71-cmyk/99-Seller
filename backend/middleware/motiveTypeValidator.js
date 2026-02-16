/**
 * Motive Type Validator Middleware
 * Validates property data based on motive type requirements
 */

const motiveTypeRules = {
    // Pre-foreclosure - Requires trustee and loan information
    PRE: {
        name: 'Pre-foreclosure',
        requiredFields: {
            // Trustee info (from Proaddress)
            'proaddress.trusteename': 'Trustee name',
            'proaddress.trusteeaddress': 'Trustee address',
            'proaddress.trusteephone': 'Trustee phone',
            // Loan info
            loans: 'At least one loan record'
        },
        requiredAssociations: ['proaddress', 'loans']
    },

    // Foreclosure - Requires auction, trustee, and loan information
    FOR: {
        name: 'Foreclosure',
        requiredFields: {
            // Auction info
            'auctions': 'At least one auction record',
            // Trustee info
            'proaddress.trusteename': 'Trustee name',
            'proaddress.trusteeaddress': 'Trustee address',
            // Loan info
            'loans': 'At least one loan record'
        },
        requiredAssociations: ['proaddress', 'auctions', 'loans']
    },

    // Auction - Requires auction and auctioneer information
    AUC: {
        name: 'Auction',
        requiredFields: {
            'auctions': 'At least one auction record',
            'auctioneer_id': 'Auctioneer information'
        },
        requiredAssociations: ['auctions', 'auctioneer']
    },

    // Probate - Requires probate case and executor/trustee information
    PRO: {
        name: 'Probate',
        requiredFields: {
            'probates': 'At least one probate record',
            'probates.case_number': 'Probate case number',
            'probates.probate_court': 'Probate court',
            'probates.executor_name': 'Executor name'
        },
        requiredAssociations: ['probates', 'proaddress']
    },

    // Code Violation - Requires violation details and current situation
    COD: {
        name: 'Code Violation',
        requiredFields: {
            'violations': 'At least one violation record',
            'violations.types': 'Violation type',
            'violations.issue_date': 'Issue date',
            'violations.current_situation': 'Current situation'
        },
        requiredAssociations: ['violations']
    },

    // Eviction - Requires eviction court details
    EVI: {
        name: 'Eviction',
        requiredFields: {
            'evictions': 'At least one eviction record',
            'evictions.court_date': 'Court date',
            'evictions.court_docket': 'Court docket number'
        },
        requiredAssociations: ['evictions']
    },

    // Divorce - Requires both owner details and case information
    DIV: {
        name: 'Divorce',
        requiredFields: {
            'divorces': 'At least one divorce record',
            'divorces.case_number': 'Case number',
            'divorces.filing_date': 'Filing date',
            'divorces.petitioner_name': 'Petitioner name',
            'divorces.respondent_name': 'Respondent name',
            'owners': 'At least two owner records'
        },
        requiredAssociations: ['divorces', 'owners']
    },

    // Unpaid Taxes - Requires tax lien information
    TAX: {
        name: 'Unpaid Taxes',
        requiredFields: {
            'taxLiens': 'At least one tax lien record',
            'taxLiens.tax_year': 'Tax year',
            'taxLiens.amount_owed': 'Amount owed',
            'taxLiens.tax_authority': 'Tax authority'
        },
        requiredAssociations: ['taxLiens']
    },

    // Out of State - Requires owner with out-of-state address
    OUT: {
        name: 'Out of State',
        requiredFields: {
            'owners': 'At least one owner record',
            'owners.is_out_of_state': 'Owner must be marked as out of state',
            'owners.OState': 'Owner state'
        },
        requiredAssociations: ['owners']
    }
};

/**
 * Validate property data based on motive type
 * @param {Object} propertyData - Property data including associations
 * @param {string} motiveTypeCode - Motive type code (PRE, FOR, AUC, etc.)
 * @param {boolean} strict - If true, throw error; if false, return warnings
 * @returns {Object} - { valid: boolean, errors: [], warnings: [] }
 */
const validateMotiveType = (propertyData, motiveTypeCode, strict = false) => {
    const errors = [];
    const warnings = [];

    // If no motive type, skip validation
    if (!motiveTypeCode) {
        return { valid: true, errors: [], warnings: ['No motive type specified'] };
    }

    const rules = motiveTypeRules[motiveTypeCode];

    if (!rules) {
        warnings.push(`Unknown motive type: ${motiveTypeCode}`);
        return { valid: true, errors: [], warnings };
    }

    // Check required associations
    if (rules.requiredAssociations) {
        rules.requiredAssociations.forEach(assoc => {
            if (!propertyData[assoc]) {
                const message = `Missing required association: ${assoc}`;
                if (strict) {
                    errors.push(message);
                } else {
                    warnings.push(message);
                }
            }
        });
    }

    // Check required fields
    Object.entries(rules.requiredFields).forEach(([fieldPath, fieldLabel]) => {
        const isValid = checkFieldPath(propertyData, fieldPath);

        if (!isValid) {
            const message = `Missing required field for ${rules.name}: ${fieldLabel}`;
            if (strict) {
                errors.push(message);
            } else {
                warnings.push(message);
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Check if a nested field path exists and has a value
 * @param {Object} obj - Object to check
 * @param {string} path - Dot-notation path (e.g., 'proaddress.trusteename')
 * @returns {boolean}
 */
const checkFieldPath = (obj, path) => {
    // Handle array checks (e.g., 'loans', 'auctions')
    if (!path.includes('.')) {
        const value = obj[path];

        // For arrays, check if at least one item exists
        if (Array.isArray(value)) {
            return value.length > 0;
        }

        // For other values, check if truthy
        return !!value;
    }

    // Handle nested paths (e.g., 'proaddress.trusteename')
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (!current || current[part] === undefined || current[part] === null) {
            return false;
        }

        current = current[part];

        // If this is an array and not the last part, check first item
        if (Array.isArray(current) && i < parts.length - 1) {
            if (current.length === 0) return false;
            current = current[0];
        }
    }

    // Final value check
    if (Array.isArray(current)) {
        return current.length > 0;
    }

    return current !== null && current !== undefined && current !== '';
};

/**
 * Express middleware for validating property data on create/update
 */
const validatePropertyMotiveType = (strict = false) => {
    return async (req, res, next) => {
        try {
            const { motive_type_id, motiveTypeCode } = req.body;

            // Skip validation if no motive type
            if (!motive_type_id && !motiveTypeCode) {
                return next();
            }

            // Get motive type code if only ID is provided
            let code = motiveTypeCode;
            if (!code && motive_type_id) {
                const { MotiveTypes } = require('../models');
                const motiveType = await MotiveTypes.findByPk(motive_type_id);
                code = motiveType?.code;
            }

            // Validate the property data
            const validation = validateMotiveType(req.body, code, strict);

            // Attach validation results to request
            req.motiveTypeValidation = validation;

            // If strict mode and validation failed, return error
            if (strict && !validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: 'Property validation failed',
                    details: validation.errors
                });
            }

            // If warnings exist, attach them to response
            if (validation.warnings.length > 0) {
                req.validationWarnings = validation.warnings;
            }

            next();
        } catch (error) {
            console.error('Motive type validation error:', error);
            next(); // Don't block on validation errors
        }
    };
};

/**
 * Get required fields for a motive type (for frontend use)
 */
const getMotiveTypeRequirements = (motiveTypeCode) => {
    const rules = motiveTypeRules[motiveTypeCode];
    if (!rules) {
        return null;
    }

    return {
        name: rules.name,
        requiredFields: Object.entries(rules.requiredFields).map(([path, label]) => ({
            path,
            label
        })),
        requiredAssociations: rules.requiredAssociations || []
    };
};

/**
 * Get all motive type configurations
 */
const getAllMotiveTypeRules = () => {
    return Object.entries(motiveTypeRules).map(([code, rules]) => ({
        code,
        name: rules.name,
        requiredFields: Object.entries(rules.requiredFields).map(([path, label]) => ({
            path,
            label
        })),
        requiredAssociations: rules.requiredAssociations || []
    }));
};

module.exports = {
    validateMotiveType,
    validatePropertyMotiveType,
    getMotiveTypeRequirements,
    getAllMotiveTypeRules,
    motiveTypeRules
};
