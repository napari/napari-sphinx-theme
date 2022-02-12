#!/usr/bin/env python
# coding: utf-8

# In[1]:


import plotly.io as pio
import plotly.express as px
import plotly.offline as py

pio.renderers.default = "notebook"

df = px.data.iris()
fig = px.scatter(df, x="sepal_width", y="sepal_length", color="species", size="sepal_length")
fig


# In[2]:


import xarray as xr
import numpy as np
data = xr.DataArray(
        np.random.randn(2, 3),
        dims=("x", "y"),
        coords={"x": [10, 20]}, attrs={"foo": "bar"}
      )
data

