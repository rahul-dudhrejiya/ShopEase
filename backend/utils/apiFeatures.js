// WHAT: Helper class for Search, Filter, Pagination
// WHY: These 3 features are used in multiple places
//      Writing once here = reuse everywhere (DRY principle)
// HOW: Each method modifies the MongoDB query
//      Methods are chained: new APIFeatures().search().filter().paginate()

class APIFeatures {
    constructor(query, queryString) {
        // query = mongoose query object (Product.find())
        // queryString = URL parameters (req.query)
        // Example: /api/products?keyword=phone&page=2&category=Electronics
        this.query = query;
        this.queryString = queryString;
    }

    // SEARCH
    search() {
        // WHAT: Search products by name or description
        // WHY: Users type keywords to find products
        // HOW: MongoDB $regex does pattern matching (like SQL LIKE)

        const keyword = this.queryString.keyword
            ? {
                name: {
                    $regex: this.queryString.keyword,
                    // WHY $regex? Matches partial words
                    // "iph" matches "iPhone 14 Pro"
                    $options: 'i',
                    // WHY 'i'? Case-insensitive
                    // "PHONE" matches "phone"
                },
            }
            : {};
        // WHY empty object if no keyword?
        // Empty {} in MongoDB = match ALL documents  

        this.query = this.query.find({ ...keyword });
        return this;
        // WHY return this? Enables method chaining
        // new APIFeatures().search().filter().paginate()
    }


    //FILTER
    filter() {
        // WHAT: Filter by category, price range, brand etc.
        // WHY: Users want to see only Electronics under ₹5000
        // HOW: Remove special params, convert price to MongoDB operators

        const queryCopy = { ...this.queryString };
        // WHY copy? Don't modify original req.query

        // Remove params that are NOT filters
        const removeFields = ['keyword', 'page', 'limit', 'sort'];
        removeFields.forEach((key) => delete queryCopy[key]);
        // WHY remove? These are handled separately
        // We don't want MongoDB to filter by "page" or "sort"

        // Convert price operators
        // URL sends: price[gte]=100&price[lte]=5000
        // We need: { price: { $gte: 100, $lte: 5000 } }

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`
            // WHY? MongoDB uses $gte not gte
            // gt  → $gt  (greater than)
            // gte → $gte (greater than or equal)
            // lt  → $lt  (less than)
            // lte → $lte (less than or equal)
        );

        this.query = this.query.find(JSON.parse(queryStr));
        return this
    }


    // SORT

    sort() {
        // WHAT: Sort products by price, rating, newest etc.
        // WHY: Users want "cheapest first" or "highest rated first"

        if (this.queryString.sort) {
            // URL: ?sort=price → sort ascending by price
            // URL: ?sort=-price → sort descending by price (- means reverse)
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Default: newest products first
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }


    // PAGINATION 
    paginate(resultsPerPage) {
        // WHAT: Split results into pages
        // WHY: Don't send 1000 products at once — too slow
        //      Send 10 per page instead
        // HOW: Calculate how many to SKIP based on current page

        const currentPage = Number(this.queryString.page) || 1;
        // WHY || 1? If no page param, default to page 1

        const skip = resultsPerPage * (currentPage - 1);
        // WHY this formula?
        // Page 1: skip 0   (show items 1-10)
        // Page 2: skip 10  (show items 11-20)
        // Page 3: skip 20  (show items 21-30)

        this.query = this.query.limit(resultsPerPage).skip(skip);
        // limit(10) = show max 10 results
        // skip(10)  = skip first 10 results
        return this;
    }
}

export default APIFeatures;
