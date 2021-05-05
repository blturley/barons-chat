import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "https://baronschat.herokuapp.com/api";

class BaronApi {

  // token for api calls
  static token;

  /// base url
  static baseUrl = BASE_URL;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: BaronApi.token };
    const params = data
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  /// routes
  static async registerUser({username, password, email}) {
    let res = await this.request(`auth/register`, {username, password, email}, 'post');
    return res.token;
  }
  static async loginUser({username, password}) {
    let res = await this.request(`auth/token`, {username, password}, 'post');
    return res.token;
  }
  static async searchusers(query = "/") {
    let res = await this.request(`users${query}`);
    return res.users;
  }
  static async getUserById(id) {
    let res = await this.request(`users/getbyid/${id}`);
    return res.user;
  }
  static async getUserByUsername(username) {
    let res = await this.request(`users/getbyusername/${username}`);
    return res.user;
  }
  static async getUserRooms(id) {
    let res = await this.request(`users/getrooms/${id}`);
    return res.rooms;
  }
  static async patchUser(id, data) {
    let res = await this.request(`users/${id}`, data, 'patch');
    return res.user;
  }
  static async deleteUser(id) {
    await this.request(`users/${id}`, {}, 'delete');
    return `user deleted`;
  }
  static async createRoom(roomname) {
    let res = await this.request(`rooms`, {roomname}, 'post');
    return res.rooms;
  }
  static async searchRooms(query = "/") {
    let res = await this.request(`rooms${query}`);
    return res.rooms;
  }
  static async getRoomById(id) {
    let res = await this.request(`rooms/getbyid/${id}`);
    return res.room;
  }
  static async getRoomByRoomname(roomname) {
    let res = await this.request(`rooms/getbyroomname/${roomname}`);
    return res.room;
  }
  static async getRoomByInvitelink(invitelink) {
    let res = await this.request(`rooms/getbyinvitelink/${invitelink}`);
    return res.room;
  }
  static async patchRoom(id, data) {
    let res = await this.request(`rooms/${id}`, data, 'patch');
    return res.room;
  }
  static async deleteRoom(id) {
    await this.request(`rooms/${id}`, {}, 'delete');
    return `room deleted`;
  }
  static async joinRoom(userid, invitelink) {
    let res = await this.request(`roomusers`, {userid, invitelink}, 'post');
    return res.joined;
  }
  static async getRoomUser(userid, roomid) {
    let res = await this.request(`roomusers`, {userid, roomid});
    return res.roomuser;
  }
  static async getRoomUsersList(id) {
    let res = await this.request(`roomusers/${id}`);
    return res.roomusers;
  }
  static async patchRoomUser(roomid, userid, data) {
    let res = await this.request(`roomusers/${roomid}/user/${userid}`, data, 'patch');
    return res.roomuser;
  }
  static async leaveRoom(userid, roomid) {
    await this.request(`roomusers`, {userid, roomid}, 'delete');
    return `left room`;
  }
}

export default BaronApi;
