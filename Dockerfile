FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["backend/AestheticTechStore.Api/AestheticTechStore.Api.csproj", "backend/AestheticTechStore.Api/"]
COPY ["backend/AestheticTechStore.Application/AestheticTechStore.Application.csproj", "backend/AestheticTechStore.Application/"]
COPY ["backend/AestheticTechStore.Domain/AestheticTechStore.Domain.csproj", "backend/AestheticTechStore.Domain/"]
COPY ["backend/AestheticTechStore.Infrastructure/AestheticTechStore.Infrastructure.csproj", "backend/AestheticTechStore.Infrastructure/"]

RUN dotnet restore "backend/AestheticTechStore.Api/AestheticTechStore.Api.csproj"
COPY . .
WORKDIR "/src/backend/AestheticTechStore.Api"
RUN dotnet build "AestheticTechStore.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AestheticTechStore.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AestheticTechStore.Api.dll"]
