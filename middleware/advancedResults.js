const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

        //Coping request query params in reqQuery array
        let reqQuery = { ...req.query }

        //Fields to exclude
        const removeFields = [ 'select', 'sort', 'limit', 'page'];

        //Looping out through removeFields array and deleting fields from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        //Creating query string from request query params
        let queryStr = JSON.stringify(reqQuery);

        //Creating mongo operator using Regular expressions
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        //Executing query
        query = model.find(JSON.parse(queryStr));

        //SELECT FIELDS
        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        //SORT FIELDS
        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy)
            } else {
                query = query.sort('-createdAt');
        }

        //PAGINATION
        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 2;
        const startIndex = (page - 1) * limit;
        const total = await model.countDocuments();
        const endIndex = page * limit;
        

        query = query.skip(startIndex).limit(limit);
        
        if(populate) {
            query = query.populate(populate)
        }
        
        //Assigning query execution results to bootcamps array
        const results = await query;

        //Pagination result
        const pagination = {}
        if(endIndex < total) {
            pagination.next = {
            page : page + 1,
            limit
            }
        }

        if(startIndex > 0) {
            pagination.previous = {
            page : page - 1,
            limit
            }
        }

        res.advancedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results
        }

        next()
}

module.exports = advancedResults