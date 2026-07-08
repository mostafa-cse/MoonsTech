using System;
using System.Collections.Generic;

namespace AestheticTechStore.Application.Common.Models;

public class PaginatedResult<T>
{
    public List<T> Items { get; set; }
    public PaginationData Pagination { get; set; }

    public PaginatedResult(List<T> items, int totalCount, int page, int limit)
    {
        Items = items;
        Pagination = new PaginationData
        {
            Total = totalCount,
            Page = page,
            Limit = limit,
            TotalPages = (int)Math.Ceiling(totalCount / (double)limit)
        };
    }
}

public class PaginationData
{
    public int Total { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
    public int TotalPages { get; set; }
}
