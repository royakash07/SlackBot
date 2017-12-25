
	import java.io.File;
import java.io.FileInputStream;


	import com.jcraft.jsch.Channel;
	import com.jcraft.jsch.ChannelSftp;
	import com.jcraft.jsch.JSch;
	import com.jcraft.jsch.Session;
public class SFTPUploadFile {
public static void main(String[] args) {
	String SFTPHOST = "Host_URL";
    int SFTPPORT = 22;
    String SFTPUSER = "User_Name";
    String SFTPPASS = "Password";
	        Session session = null;
	        Channel channel = null;
	        ChannelSftp channelSftp = null;

	        try {
	            JSch jsch = new JSch();
	            session = jsch.getSession(SFTPUSER, SFTPHOST, SFTPPORT);
	            session.setPassword(SFTPPASS);
	            java.util.Properties config = new java.util.Properties();
	            config.put("StrictHostKeyChecking", "no");
	            session.setConfig(config);
	            session.connect();
	            channel = session.openChannel("sftp");
	            channel.connect();
	            channelSftp = (ChannelSftp) channel;
	            File f = new File("Location of File to Uploaded");
	            channelSftp.put(new FileInputStream(f), f.getName());
	        } catch (Exception ex) {
	            ex.printStackTrace();
	        }
	    }
	    
	}

