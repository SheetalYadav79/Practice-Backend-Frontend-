import React, { useState, useEffect } from "react";
import axios from "axios";
import "./hero.css";

const Hero = () => {
  const apiURL = "http://localhost:7000";

  const [formData, setFormData] = useState({
    userName: "",
    userCourse: "",
    userAge: "",
    userImage: "",
  });

  const [userData, setUserData] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.get(`${apiURL}/getdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
      console.log(userData)
    } catch (error) {
      console.error("There was an error fetching the user data!", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return null;

    const imageData = new FormData();
    imageData.append("file", selectedFile);
    imageData.append("upload_preset", "hbymetjn");

    try {
      setIsUploading(true);
      setError(null);

      const response = await fetch("https://api.cloudinary.com/v1_1/du6u386y8/image/upload", {
        method: "POST",
        body: imageData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setIsUploading(false);
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Error uploading image");
      setIsUploading(false);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let imageUrl = formData.userImage;

    if (selectedFile) {
      imageUrl = await handleImageUpload();
      if (!imageUrl) {
        setError("Image upload failed. Cannot submit form.");
        return;
      }
    }

    const newFormData = {
      ...formData,
      userImage: imageUrl,
    };

    try {
      if (editingUserId) {
        await updateUser(editingUserId, newFormData);
      } else {
        await addUser(newFormData);
      }

      setFormData({
        userName: "",
        userCourse: "",
        userAge: "",
        userImage: "",
      });
      setSelectedFile(null);
      setEditingUserId(null);
      fetchUserData();
    } catch (error) {
      setError("There was an error submitting the form.");
      console.error("Error submitting form:", error);
    }
  };

  const addUser = async (user) => {
    try {
      const token = localStorage.getItem("jwt");
      await axios.post(`${apiURL}/userdata`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("There was an error adding the user!", error);
    }
  };

  const updateUser = async (userId, user) => {
    try {
      const token = localStorage.getItem("jwt");
      await axios.put(`${apiURL}/updatedata/${userId}`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("There was an error updating the user!", error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("jwt");
      await axios.delete(`${apiURL}/deletedata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { _id: userId },
      });
      fetchUserData();
    } catch (error) {
      console.error("There was an error deleting the user!", error);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      userName: user.userName,
      userCourse: user.userCourse,
      userAge: user.userAge,
      userImage: user.userImage,
    });
    setEditingUserId(user._id);
  };

  return (
    <div className="user-details">
      <form onSubmit={handleSubmit}>
        <h2>{editingUserId ? "Edit User" : "Add User"}</h2>
        <input
          className="input-box"
          type="text"
          name="userName"
          placeholder="Name"
          value={formData.userName}
          onChange={handleChange}
        />
        <br />
        <input
          className="input-box"
          type="text"
          name="userCourse"
          placeholder="Course"
          value={formData.userCourse}
          onChange={handleChange}
        />
        <br />
        <input
          className="input-box"
          type="number"
          name="userAge"
          placeholder="Age"
          value={formData.userAge}
          onChange={handleChange}
        />
        <br />
        <input
          type="file"
          name="userImage"
          accept="image/*"
          onChange={handleFileChange}
        />
        <br />
        <button className="submit-button" type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : editingUserId ? "Update User" : "Add User"}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <div>
        <h2>User List</h2>
        {userData?.length > 0 ? (
          <ul>
            {userData.map((user) => (
              <li key={user._id}>
                {user.userImage && <img src={user.userImage} alt={user.userName} width="50" />}
                {user.userName} - {user.userCourse} - {user.userAge}
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => deleteUser(user._id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users available</p>
        )}
      </div>
    </div>
  );
};

export default Hero;
