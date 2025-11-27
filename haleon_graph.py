import pandas as pd
import plotly.express as px
import base64

# Load data
file_path = "/mnt/data/Haleon Impressions by Year and Month.xlsx"
df = pd.read_excel(file_path)

# Build Period column
df["Period"] = df["Year"].astype(str) + "-" + df["Month"].astype(str).str.zfill(2)

# Country mapping
country_map = {
    "CZ": "Czechia","SK": "Slovakia","RO": "Romania","HU": "Hungary",
    "UA": "Ukraine","SA": "Saudi Arabia","PL": "Poland","GR": "Greece",
    "ZA": "South Africa"
}
df["CountryName"] = df["Country"].astype(str).map(country_map).fillna(df["Country"].astype(str))

# Aggregate
agg = df.groupby(["Period","Customer","CountryName","Brand"],as_index=False)["Planned_k"].sum()
agg = agg.rename(columns={"Planned_k":"Impressions_k"})

# Build figure
fig = px.scatter(
    agg,
    x="Period",
    y="Impressions_k",
    color="Brand",
    symbol="Customer",
    hover_data={"Customer": True,"CountryName": True,"Brand": True,"Impressions_k": True,"Period": True}
)
fig.update_traces(marker=dict(size=10))

# Keep title but remove custom header
fig.update_layout(
    title=dict(
        text="Haleon impressions by Month, Brand, Customer, Country",
        font=dict(family="Alfa Slab One", size=28)
    ),
    xaxis_title="Year-Month",
    yaxis_title="Impressions (k)",
    width=1300,
    height=750
)

# Logo if needed later
with open("/mnt/data/Monetizr logos_Monetizr-H.png","rb") as f:
    logo_b64 = base64.b64encode(f.read()).decode()

plot_html = fig.to_html(include_plotlyjs="cdn", full_html=False)

html = f"""
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
body {{
    font-family: 'Lato', sans-serif;
    margin: 20px;
}}
</style>
</head>
<body>

{plot_html}

</body>
</html>
"""

out = "/mnt/data/haleon_chart_clean_title.html"
with open(out,"w") as f:
    f.write(html)

out
