import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import Button from '../components/Button';
import Input from '../components/Input';
import { useFormik } from 'formik';
//import Overview from './Dashboard/Student/Overview';
import { useHistory } from 'react-router-dom';
import { RiErrorWarningFill } from 'react-icons/ri';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//import ReactDOM from 'react-dom';
// import {
//   BrowserRouter as Router,
//   Switch,
//   useLocation,
//   Redirect,
//   Link,
//   Route,
// } from 'react-router-dom';
import { http } from '../http';
import { useStateValue } from './../store/stateProvider';

const Login = () => {
  const notify = () => toast('Wow so easy!');
  const [{ login }, dispatch] = useStateValue();
  const history = useHistory();
 // const [newtoast, setToast] = useState('');
  const [text, setTest] = useState(false);
  const handleloginDetails = () => {
    dispatch({
      type: 'SET_LOGIN',
      login: true,
    });
  };
  function handleClick() {
    history.push('/dashboard/overview');
  }

  let loginurl = 'students/login';
  const [submit, setSubmit] = useState(false);
  const [loginform, setloginform] = useState('');
  const [correct, setCorrect] = useState(false);
  async function login1(value) {
    return await http('post', loginurl, value);
  }

  const validate = (values) => {
    const errors = {};

    if (!values.registrationNumber) {
      errors.registrationNumber = 'Required';
    } else if (!/RA[0-9]{13}$/i.test(values.registrationNumber)) {
      errors.registrationNumber = 'Invalid Registration Number';
    }

    if (!values.password) {
      errors.password = 'Required';
    }

    // } else if (values.password.length < 5) {
    //   errors.password = 'Must be 5 characters or more';
    else if (values.password === '12345678') {
      errors.password = 'Must not be 12345678 !!!';
    }

    return errors;
  };
  const [submit1, setSubmit1] = useState(false);
  useEffect(() => {
    
    toast.dark(correct, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, [text,correct]);

  console.log(text);

  const formik = useFormik({
    initialValues: {
      registrationNumber: '',
      password: '',
    },
    validate,
    onSubmit: async (values) => {
      
      console.log('submit');
      try {
        let response = await login1(values);
        console.log(response.data);
        console.log(submit1);
        setSubmit(true);
        if (response.data.message === 'password is Incorrect') {
          throw new Error('Password is incorrect');
        }
        else if (response.data.message === 'UnRegistered') {
          throw new Error('User not registered');
        }
         else if (response.data.message === 'verify') {
          throw new Error('Verify your email');
        } else{
         await handleloginDetails();
         console.log(login);
        await localStorage.setItem('token', response.data.token);
        await localStorage.setItem('user', response.data.user);
          history.push('/dashboard/overview');
        
        await setSubmit(true);
       
        }
      } catch (error) {
        setCorrect(error.message);

        console.log(error.message);
      }
      console.log(JSON.stringify(values, null));
    },
  });

  return (
    <div>
      <div className='flex w-screen h-screen'>
        <div className='h-screen bg-side bg-cover bg-black w-4/12 flex items-center'>
          <div className='w-full text-center'>
            <img className='mx-auto' src={logo} alt='logo' />
            <h1 className='text-3xl mt-3 text-center text-white font-semibold'>
              Métier
            </h1>

            <button
              className='outline-none button bg-white px-6 mt-36 text-lg py-3 rounded-lg'
              onClick={() => {
                history.push('/faculty');
              }}
            >
              Login as faculty
            </button>
          </div>
        </div>
        <div className='h-screen w-8/12 bg-light flex items-center'>
          <div className='w-screen mx-64'>
            <h1 className='text-2xl font-semibold' onClick={() => notify}>
              Student Login
            </h1>
            <p className='text-dark mt-1'>We are glad to see you here</p>

            <form onSubmit={formik.handleSubmit}>
              <div className='relative'>
                <Input
                  name='registrationNumber'
                  title='Registration Number'
                  type='text'
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.registrationNumber}
                />
                {formik.touched.registrationNumber &&
                  formik.errors.registrationNumber && (
                    <p className='text-sm flex items-center gap-1 text-red-500 mt-1'>
                      <RiErrorWarningFill />
                      {formik.errors.registrationNumber}
                    </p>
                  )}
              </div>
              <Input
                name='password'
                title='Password'
                type='password'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password && (
                <p className='text-sm flex items-center gap-1 text-red-500 mt-1'>
                  <RiErrorWarningFill />
                  {formik.errors.password}
                </p>
              )}

              <Button
                type='submit'
                onClick={() => {
                  
                }}
                name='Login'
              ></Button>
              {!!correct ? (
                <ToastContainer
                  position='top-right'
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              ) : (
                ''
              )}
            </form>
            <p className='text-lg mt-8'>
              New here?{' '}
              
                <span className='text-primary font-semibold cursor-pointer' onClick={()=>{history.push('/register')}}>
                  Register
                </span>
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
