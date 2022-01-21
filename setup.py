from setuptools import setup

setup(
    name='napari-sphinx-theme',
    description='Sphinx theme for napari.',
    version='0.1.0',
    include_package_data=True,
    python_requires='>=3.6',
    author='Jeremy Asuncion',
    author_email='jeremyasuncion808@gmail.com',
    package_dir={'': 'src'},
    packages=['napari_sphinx_theme'],
    install_requires=['beautifulsoup4==4.10.0'],
    entry_points={
        'sphinx.html_themes': [
            'napari=napari_sphinx_theme'
        ],
    },
)
