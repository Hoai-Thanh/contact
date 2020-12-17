import lodash from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';

class UpdateContactHelper {
  static async updateContact(contact) {
    let data = [];
    try {
      if (lodash.isNil(contact) || lodash.isEmpty(contact)) {
        throw 'Miss contact object.';
      }
      const value = await AsyncStorage.getItem('@contact');
      if (value) {
        data = JSON.parse(value);
        if (data && data.length > 0) {
          console.log('dlsajfslfjslkfjsalkfjsafs', contact);
          const index = data.findIndex((item) => item.id === contact.id);

          if (index > -1) {
            data[index].group = lodash.get(contact, 'group', null); //Only update group
            const contactData = JSON.stringify(data);
            await AsyncStorage.setItem('@contact', contactData);
            return true;
          } else {
            return false;
          }
        }
      }
    } catch (e) {
      throw e;
    }
  }
}

export default UpdateContactHelper;
