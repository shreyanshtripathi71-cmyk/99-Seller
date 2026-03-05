const axios = require('axios');
async function test() {
    const { data } = await axios.get('http://localhost:5000/api/properties/41');
    const property = data.data;

    // Let's see if this exact block throws in Node
    try {
        const rows = [
            ["Property Address", property.property?.address || "N/A"],
            ["City", property.property?.city || "N/A"], ["State", property.property?.state || "N/A"], ["ZIP", property.property?.zip || "N/A"],
            ["Beds", String(property.property?.beds ?? "N/A")], ["Baths", String(property.property?.baths ?? "N/A")],
            ["Sqft", String(property.property?.sqft ?? "N/A")], ["Year Built", String(property.property?.yearBuilt ?? "N/A")],
            ["Appraised Value", property.property?.appraisedValue != null ? `$${Number(property.property.appraisedValue).toLocaleString()}` : "N/A"],
            ["", ""],
            ["Owner Name", property.owner?.name || "N/A"],
            ["Owner Phone", property.owner?.phone || "N/A"],
            ["Owner Email", property.owner?.email || "N/A"],
            ["Mailing Address", property.owner?.mailingAddress || "N/A"],
            ["", ""],
            ["Distress Type", property.type || "N/A"],
            ["Total Debt", property.financials?.totalDebt != null ? `$${Number(property.financials.totalDebt).toLocaleString()}` : "N/A"],
            ["Equity", property.financials?.estimatedEquity != null ? `$${Number(property.financials.estimatedEquity).toLocaleString()}` : "N/A"],
        ];
        console.log('SUCCESS');
        console.log(rows);
    } catch (err) {
        console.log('ERROR:', err.message);
    }
}
test();
