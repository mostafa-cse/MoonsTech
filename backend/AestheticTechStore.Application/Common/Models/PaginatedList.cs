using System;
using System.Collections.Generic;

namespace AestheticTechStore.Application.Common.Models;

public class PaginatedList<T>
{
    public List<T> Items { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalCount { get; }

    public PaginatedList(List<T> items, int count, int page, int pageSize)
    {
        Page = page;
        PageSize = pageSize;
        TotalCount = count;
        Items = items;
    }
}
