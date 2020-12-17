import lodash from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContactModel } from '../model/ContactModel';
import GroupsHelper from './GroupsHelper';

class FetchContactHelper {
  static async getUserInfo() {
    try {
      const value = await AsyncStorage.getItem('@userInfo');
      if (value === null) {
        let data = {}
        try {
          let response = await fetch(
            'http://172.17.100.14/public-api/employee/detail?id=2035298'
          );
          let json = await response.json();
          if (json?.data) {
            data = json?.data;
          }
          const contactData = JSON.stringify(data);
          await AsyncStorage.setItem('@userInfo', contactData);
        } catch (error) {
          console.log(error)
        }
      }
    } catch (e) {
      console.log('FetchContactHelper initData error', e);
    }
  }

  static async getGroups() {
    let data = [];
    try {
      const userInfo = await AsyncStorage.getItem('@userInfo');
      const user = JSON.parse(userInfo)
      console.log(user)
      let response = await fetch(
        'http://172.17.100.14/public-api/group/by-employee', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employee_id: user?.id,
          })
        }
      );
      let json = await response.json();
      if (json?.data && json?.data?.length > 0) {
        data = json?.data;
      }
      const groupData = JSON.stringify(data);
      console.log(groupData)
      await AsyncStorage.setItem('@groups', groupData);
    } catch (error) {
      console.log(error)
    }
    return data;
  }

  static async getContacts() {
    let data = [];
    try {
      const value = await AsyncStorage.getItem('@contact');
      const groups = await GroupsHelper.getSelectedGroups();
      if (value === null) {
        try {
          let response = await fetch(
            'http://172.17.100.14/public-api/employee/all'
          );
          let json = await response.json();
          if (json?.data && json?.data?.length > 0) {
            data = json?.data;
          }
          const contactData = JSON.stringify(data);
          await AsyncStorage.setItem('@contact', contactData);
        } catch (error) {
          data = JSON.parse(value);
        }
      } else {
        data = JSON.parse(value);
      }
      let parseData = data.map((item) => {
        return new ContactModel(item);
      });
      if (groups.length === 0) {
        return parseData;
      } else {
        console.log('groups-------->', groups);
        let filteredData = [];
        groups.forEach((item) => {
          parseData.forEach((data) => {
            if (!lodash.isNil(data.group)) {
              if (item.id === data.group) {
                filteredData.push(data);
              }
            }
          });
        });
        console.log('xxxx', filteredData);
        return filteredData;
      }
    } catch (e) {
      console.log('FetchContactHelper getContacts error', e);
    }
    return data;
  }

  static groupAlphabetContact(contacts) {
    try {
      if (!lodash.isArray(contacts)) {
        return [];
      }
      let data = contacts
        .sort((a, b) => a.shortFullName.localeCompare(b.shortFullName))
        .reduce((r, e) => {
          let group = e.shortFullName[0];
          if (!r[group]) r[group] = { title: group, data: [e] };
          else r[group].data.push(e);
          return r;
        }, {});
      return Object.values(data);
    } catch (e) {
      console.log('FetchContactHelper groupAlphabetContact error', e);
    }
    return [];
  }

  static filterContacts(searchText, contacts) {
    try {
      if (!lodash.isArray(contacts)) {
        return [];
      }
      if (lodash.isNil(searchText) || lodash.isEmpty(searchText)) {
        return contacts;
      }
      const text = searchText.trim().toUpperCase();
      let data = contacts.filter((item) => {
        return item.fullName.toUpperCase().includes(text);
      });
      return data;
    } catch (e) {
      console.log('FetchContactHelper groupAlphabetContact error', e);
    }
    return [];
  }
}

export default FetchContactHelper;
