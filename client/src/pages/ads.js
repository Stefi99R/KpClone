import Cookies from 'js-cookie';
import * as React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { privateApi } from '../config/axios-instance';
import { UserContext } from '../contexts/UserContext';
import '../assets/styles/ads.css';
import { useHistory } from 'react-router-dom';
import 'bootstrap';
import debounce from 'lodash.debounce';

export function Ads() {

    const [price, setPrice ] = React.useState('');
    const [ category, setCategory ] = React.useState('');
    const [ onlyMe, setOnlyMe ] = React.useState(false);
    const [ search, setSearch ] = React.useState('');
    const [ inputSearch, setInputSearch ] = React.useState('');
    const history = useHistory();

    const { user } = React.useContext(UserContext);

    const [ page, setPage ] = React.useState(10);

    const {
        status,
        data,
        error,
        isFetching,
    } = useQuery(['ads', [onlyMe, price, category, search]], () => filter(onlyMe, price, category, search), { keepPreviousData: false});


    const filter = async (onlyMe, price, category, search) => {

        let query = '/ads?';

        let where = {
            search: '',
            onlyMe: false,
            price: '',
            category: ''
        };

        if (search !== '') {
            where.search = 'search=' + search;
        }
        if (onlyMe) {
            where.onlyMe = 'onlyMe=' + user.id;
        }
        if (price !== '') {
            let asc = 'asc';
            if (price === 'min') {
                asc = 'asc=false'
            }
            where.price = '' + asc + '&price=' + price;
        }
        if (category !== '') {
            where.category = 'category=' + category;
        }

        for (const [key, value] of Object.entries(where)) {
            query += `${value}&`;
        }

        const { data } = await privateApi(query);
        return data;
    }

    const handleCategoryChange = (event) => {
        setCategory(event.target.value)
    };

    const handleMine = () => {
        setOnlyMe(!onlyMe);
    }

    const handlePriceFilter = (event) => {
        setPrice(event.target.value);
    }

    const handleSearchInput = (event) => {
        setInputSearch(event.target.value);
    }

    const handleSearch = 
        React.useCallback(debounce((event) => {
                setSearch(event.target.value);
        }, 200), []);
    

    const openAd = (id) => {
        history.push(`/ad/${id}`);
    }

    return (
        
        <div>
            <>
            <div class="row">
                <div class="col-md-4">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" placeholder="Enter text..." onChange={handleSearch}/>
                        <button class="btn btn-info" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-4">
                <select  class="form-select" value={category} onChange={handleCategoryChange}>
                    <option value="" disabled>Choose a category:</option>
                    <option value="clothing">clothing</option>
                    <option value="tools">tools</option>
                    <option value="sports">sports</option>
                    <option value="accessories">accessories</option>
                    <option value="furniture">furniture</option>
                    <option value="pets">pets</option>
                    <option value="games">games</option>
                    <option value="books">books</option>
                    <option value="technology">technology</option>
                </select>
                </div>
                <div class="col-md-4">
                    {Cookies.get('access_token') === undefined ? (
                        <p hidden></p>
                    ) : (
                        <>
                            <div class="form-check">
                                <input class="form-check-input" id="mine" type="checkbox" onChange={handleMine}/>
                                <label class="form-check-label">Only mine</label>
                            </div>
                        </>
                    )}
                </div>
                <div class="col-md-4">
                <select class="form-select" value={price} onChange={handlePriceFilter}>
                    <option value="" disabled>Sort by price:</option>
                    <option id="min" name="price" value="min">Ascending</option>
                    <option id="max" name="price" value="max">Descending</option>
                </select>
                </div>
            </div>
            </>
                    {/* <button type="button" onClick={() => {setPage(page + 10)}}>more</button> */}
            <div>
                { status === "loading" ? (
                    <div class="d-flex justify-content-center">
                        <div class="spinner-border" role="status" style={{marginTop: 200 + 'px'}}>
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : status === "error" ? (
                    <div class="alert alert-danger" role="alert">
                        Error: {error}
                    </div>
                ) : (
                    <>
                    { data.length > 0 ? (
                        <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Price</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">City</th>
                                    <th scope="col">View count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((ad) => (
                                    <tr onClick={() => openAd(ad.id)} key={ad.id}>
                                    <th scope="row">
                                        <img src={ad.url} width="250" height="200"/>
                                    </th>
                                    <td>{ad.name}</td>
                                    <td>
                                    {ad.price} <span class="badge bg-success">$</span>
                                    </td>
                                    <td><span class="badge bg-info text-dark">{ad.category}</span></td>
                                    <td>{ad.city}</td>
                                    <td>
                                        <span class="badge bg-dark">{ad.count}</span>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    ) : (
                        <div class="alert alert-warning my-5 text-center" role="alert">
                            No data to display!
                        </div>
                    ) }
                        
                    </>
                )
            }
            </div>
        </div>
    );
}